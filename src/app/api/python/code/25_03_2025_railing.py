import ifcopenshell
import ifcopenshell.geom
import numpy as np
from collections import defaultdict
import sys


def get_level_info(element):
    """Получает информацию об уровне для элемента (название и отметку)."""
    for rel in getattr(element, 'ContainedInStructure', []):
        if rel.is_a('IfcRelContainedInSpatialStructure'):
            level = rel.RelatingStructure
            level_name = getattr(level, 'Name', 'Unknown Level')
            
            # Получаем отметку уровня
            elevation = None
            if hasattr(level, 'Elevation'):
                elevation = level.Elevation
            elif hasattr(level, 'ObjectPlacement'):
                placement = level.ObjectPlacement
                while placement:
                    if placement.is_a('IfcLocalPlacement'):
                        if placement.RelativePlacement.is_a('IfcAxis2Placement3D'):
                            location = placement.RelativePlacement.Location
                            elevation = location.Coordinates[2]
                            break
                    placement = getattr(placement, 'PlacementRelTo', None)
            
            return {
                'name': level_name,
                'elevation': elevation
            }
    return {'name': 'Unknown Level', 'elevation': None}


def calculate_railing_geometry_length(railing):
    """Вычисляет длину перил по геометрии."""
    settings = ifcopenshell.geom.settings()
    try:
        shape = ifcopenshell.geom.create_shape(settings, railing)
        if shape:
            verts = np.array(shape.geometry.verts).reshape(-1, 3)
            if len(verts) > 1:
                # Простое вычисление длины как разницы между крайними точками
                min_coords = np.min(verts, axis=0)
                max_coords = np.max(verts, axis=0)
                return np.linalg.norm(max_coords - min_coords)
    except Exception as e:
        print(f"Ошибка при расчете геометрии перил: {e}", file=sys.stderr)
    return 0.0


def get_railings_analysis(ifc_file):
    """Анализирует перила с группировкой по уровням."""
    railings_info = []
    type_stats = defaultdict(lambda: {'count': 0, 'total_length': 0})
    level_stats = defaultdict(lambda: {
        'count': 0,
        'types': set(),
        'railings': [],
        'total_length': 0.0,
        'elevation': None
    })

    railings = ifc_file.by_type('IfcRailing')

    for railing in railings:
        railing_name = getattr(railing, 'Name', 'Unnamed Railing')
        railing_type = getattr(railing, 'ObjectType', 'N/A')
        description = getattr(railing, 'Description', 'N/A')

        # Параметры по умолчанию
        params = {
            'Length': 1000,  # мм
            'Height': 900,
            'Material': 'Не указан'
        }

        # Извлечение параметров из свойств
        for rel in getattr(railing, 'IsDefinedBy', []):
            if rel.is_a('IfcRelDefinesByProperties'):
                pset = rel.RelatingPropertyDefinition
                if pset.is_a('IfcPropertySet'):
                    for prop in pset.HasProperties:
                        if prop.Name in params and hasattr(prop, 'NominalValue'):
                            params[prop.Name] = prop.NominalValue.wrappedValue

        # Расчет длины по геометрии
        geom_length = calculate_railing_geometry_length(railing)
        # Конвертация из метров в миллиметры
        geom_length *= 1000 if geom_length > 0 else 0

        # Используем длину из геометрии, если она больше нуля, иначе из параметров
        length = geom_length if geom_length > 0 else params['Length']

        # Получаем информацию об уровне
        level_info = get_level_info(railing)

        railing_data = {
            'name': railing_name,
            'type': railing_type,
            'description': description,
            'parameters': params,
            'length': length,
            'level_name': level_info['name'],
            'level_elevation': level_info['elevation'],
            'global_id': getattr(railing, 'GlobalId', 'N/A'),
            'length_source': 'Geometry' if geom_length > 0 else 'Parameters'
        }

        railings_info.append(railing_data)

        # Статистика по типам
        type_stats[railing_type]['count'] += 1
        type_stats[railing_type]['total_length'] += length

        # Статистика по уровням
        level_name = level_info['name']
        level_stats[level_name]['count'] += 1
        level_stats[level_name]['types'].add(railing_type)
        level_stats[level_name]['railings'].append(railing_data)
        if level_info['elevation'] is not None:
            level_stats[level_name]['elevation'] = level_info['elevation']
        level_stats[level_name]['total_length'] += length

    return {
        'railings': railings_info,
        'type_stats': dict(type_stats),
        'level_stats': dict(level_stats),
        'total_count': len(railings_info),
        'total_length': sum(railing['length'] for railing in railings_info)
    }


def main():
    if len(sys.argv) < 2:
        print("Error: No IFC file path provided", file=sys.stderr)
        sys.exit(1)
    model_path = sys.argv[1]
    try:
        ifc_file = ifcopenshell.open(model_path)
        analysis = get_railings_analysis(ifc_file)

        # Вывод результатов
        print(f"\nОбщее количество перил: {analysis['total_count']}")
        print(f"Общая длина перил: {analysis['total_length']:.2f} мм\n")

        # Детализированный вывод по уровням
        for level, stats in sorted(analysis['level_stats'].items()):
            level_elevation = f"{stats['elevation']:.2f}" if stats.get('elevation') is not None else "N/A"
            
            for i, railing in enumerate(stats['railings'], 1):
                print(f"\n  Перила {i}:")
                print(f"    Название: {railing['name']}")
                print(f"    GlobalId: {railing['global_id']}")
                print(f"    Тип: {railing['type']}")
                print(f"    Длина: {railing['length']:.1f} мм (источник: {railing['length_source']})")
                print(f"    Высота: {railing['parameters']['Height']} мм")
                print(f"    Материал: {railing['parameters']['Material']}")
                print(f"    Уровень: {railing['level_name']}")
                if railing['level_elevation'] is not None:
                    print(f"    Отметка уровня: {railing['level_elevation']:.2f} м")


    except Exception as e:
        print(f"Error processing IFC file: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
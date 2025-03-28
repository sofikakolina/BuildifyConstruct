import ifcopenshell
import ifcopenshell.geom
import numpy as np
from collections import defaultdict
import sys


def get_level_name(element):
    """Получает название уровня для элемента."""
    for rel in getattr(element, 'ContainedInStructure', []):
        if rel.is_a('IfcRelContainedInSpatialStructure'):
            return getattr(rel.RelatingStructure, 'Name', 'Unknown Level')
    return 'Unknown Level'


def get_level_elevation(level):
    """Получает отметку уровня из его свойств."""
    if hasattr(level, 'Elevation'):
        return level.Elevation
    elif hasattr(level, 'ObjectPlacement'):
        placement = level.ObjectPlacement
        while placement:
            if placement.is_a('IfcLocalPlacement'):
                if placement.RelativePlacement.is_a('IfcAxis2Placement3D'):
                    location = placement.RelativePlacement.Location
                    return location.Coordinates[2]
            placement = getattr(placement, 'PlacementRelTo', None)
    return None


def calculate_geometry_volume(stair):
    """Вычисляет объем лестницы по геометрии."""
    settings = ifcopenshell.geom.settings()
    try:
        shape = ifcopenshell.geom.create_shape(settings, stair)
        if shape:
            verts = np.array(shape.geometry.verts).reshape(-1, 3)
            faces = np.array(shape.geometry.faces).reshape(-1, 3)
            
            volume = 0.0
            for face in faces:
                v0, v1, v2 = verts[face]
                volume += np.dot(v0, np.cross(v1, v2)) / 6.0
            return abs(volume)
    except Exception as e:
        print(f"Ошибка при расчете геометрии лестницы: {e}", file=sys.stderr)
    return 0.0


def get_stairs_analysis(ifc_file):
    """Анализирует лестницы с группировкой по уровням."""
    stairs_info = []
    type_stats = defaultdict(lambda: {'count': 0, 'total_volume': 0})
    level_stats = defaultdict(lambda: {
        'count': 0,
        'types': set(),
        'stairs': [],
        'total_volume': 0.0
    })

    stairs = ifc_file.by_type('IfcStair') + ifc_file.by_type('IfcStairFlight')

    for stair in stairs:
        stair_name = getattr(stair, 'Name', 'Unnamed Stair')
        stair_type = getattr(stair, 'ObjectType', 'N/A')
        description = getattr(stair, 'Description', 'N/A')

        # Параметры по умолчанию
        params = {
            'TreadLength': 280,  # мм
            'RiserHeight': 172.63,
            'NumberOfTreads': 10,
            'Width': 1000
        }

        # Извлечение параметров из свойств
        for rel in getattr(stair, 'IsDefinedBy', []):
            if rel.is_a('IfcRelDefinesByProperties'):
                pset = rel.RelatingPropertyDefinition
                if pset.is_a('IfcPropertySet') and pset.Name == 'Pset_StairCommon':
                    for prop in pset.HasProperties:
                        if prop.Name in params and hasattr(prop, 'NominalValue'):
                            params[prop.Name] = prop.NominalValue.wrappedValue

        # Расчет объема по параметрам
        param_volume = (params['TreadLength'] * params['Width'] * 
                       params['RiserHeight'] * params['NumberOfTreads']) / 1e9  # в м³

        # Расчет объема по геометрии
        geom_volume = calculate_geometry_volume(stair)

        # Используем объем из геометрии, если он больше нуля, иначе из параметров
        volume = geom_volume if geom_volume > 0 else param_volume

        # Определение уровня
        level = get_level_name(stair)
        elevation = None
        for rel in getattr(stair, 'ContainedInStructure', []):
            if rel.is_a('IfcRelContainedInSpatialStructure'):
                level_obj = rel.RelatingStructure
                elevation = get_level_elevation(level_obj)
                break

        stair_data = {
            'name': stair_name,
            'type': stair_type,
            'description': description,
            'parameters': params,
            'volume': volume,
            'level': level,
            'elevation': elevation,
            'global_id': getattr(stair, 'GlobalId', 'N/A'),
            'volume_source': 'Geometry' if geom_volume > 0 else 'Parameters'
        }

        stairs_info.append(stair_data)

        # Статистика по типам
        type_stats[stair_type]['count'] += 1
        type_stats[stair_type]['total_volume'] += volume

        # Статистика по уровням
        level_stats[level]['count'] += 1
        level_stats[level]['types'].add(stair_type)
        level_stats[level]['stairs'].append(stair_data)
        if elevation is not None:
            level_stats[level]['elevation'] = elevation
        level_stats[level]['total_volume'] += volume

    return {
        'stairs': stairs_info,
        'type_stats': dict(type_stats),
        'level_stats': dict(level_stats),
        'total_count': len(stairs_info),
        'total_volume': sum(stair['volume'] for stair in stairs_info)
    }


def main():
    if len(sys.argv) < 2:
        print("Error: No IFC file path provided", file=sys.stderr)
        sys.exit(1)
    model_path = sys.argv[1]
    try:
        ifc_file = ifcopenshell.open(model_path)
        analysis = get_stairs_analysis(ifc_file)

        # Вывод результатов
        print(f"\nОбщее количество лестниц: {analysis['total_count']}")
        print(f"Общий объем бетона для лестниц: {analysis['total_volume']:.3f} м³")

        # Детализированный вывод по уровням
        for level, stats in sorted(analysis['level_stats'].items()):
            level_elevation = f"{stats['elevation']:.2f}" if stats.get('elevation') is not None else "N/A"

            for i, stair in enumerate(stats['stairs'], 1):
                print(f"\n  Лестница {i}:")
                print(f"    Название: {stair['name']}")
                print(f"    GlobalId: {stair['global_id']}")
                print(f"    Тип: {stair['type']}")
                print(f"    Длина ступени: {stair['parameters']['TreadLength']} мм")
                print(f"    Высота подступенка: {stair['parameters']['RiserHeight']} мм")
                print(f"    Количество ступеней: {stair['parameters']['NumberOfTreads']}")
                print(f"    Ширина: {stair['parameters']['Width']} мм")
                print(f"    Объем бетона: {stair['volume']:.3f} м³ (источник: {stair['volume_source']})")
                print(f"    Уровень: {stair['level']}")
                if stair['elevation'] is not None:
                    print(f"    Отметка уровня: {stair['elevation']:.2f} м")


    except Exception as e:
        print(f"Error processing IFC file: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
import ifcopenshell
import ifcopenshell.geom
import numpy as np
from collections import defaultdict
import sys


def calculate_volume_and_dimensions(geometry):
    """Вычисляет объем и габариты объекта по его геометрии."""
    verts = np.array(geometry.verts).reshape(-1, 3)  # Вершины
    faces = np.array(geometry.faces).reshape(-1, 3)  # Грани

    # Вычисление объема
    volume = 0.0
    for face in faces:
        v0, v1, v2 = verts[face]
        volume += np.dot(v0, np.cross(v1, v2)) / 6.0
    volume = abs(volume)

    # Вычисление габаритов (ширина, высота, длина)
    if len(verts) > 0:
        min_coords = np.min(verts, axis=0)
        max_coords = np.max(verts, axis=0)
        dimensions = max_coords - min_coords
        width, height, length = dimensions
    else:
        width, height, length = 0.0, 0.0, 0.0

    return volume, width, height, length


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


def get_beams_analysis(ifc_file):
    """Анализирует балки с группировкой по типам и этажам."""
    beams_info = []
    type_stats = defaultdict(lambda: {'count': 0, 'total_volume': 0})
    level_stats = defaultdict(lambda: {
        'count': 0,
        'types': set(),
        'beams': [],
        'total_volume': 0
    })

    beams = ifc_file.by_type('IfcBeam')

    for beam in beams:
        # Основные свойства
        beam_name = getattr(beam, 'Name', 'Unnamed Beam')
        beam_type = getattr(beam, 'ObjectType', 'N/A')
        description = getattr(beam, 'Description', 'N/A')

        # Извлечение материалов
        materials = []
        for rel in getattr(beam, 'HasAssociations', []):
            if rel.is_a('IfcRelAssociatesMaterial'):
                material = rel.RelatingMaterial
                if material.is_a('IfcMaterial'):
                    materials.append(material.Name)
                elif material.is_a('IfcMaterialLayerSet'):
                    for layer in material.MaterialLayers:
                        if hasattr(layer, 'Material'):
                            materials.append(layer.Material.Name)

        # Определение уровня (этажа)
        level = 'Unknown Level'
        elevation = None
        for rel in getattr(beam, 'ContainedInStructure', []):
            if rel.is_a('IfcRelContainedInSpatialStructure'):
                level_obj = rel.RelatingStructure
                level = getattr(rel.RelatingStructure, 'Name', 'Unknown Level')
                elevation = get_level_elevation(level_obj)
                break

        # Получение геометрии и расчет объема/габаритов
        volume = 0.0
        width = 0.0
        height = 0.0
        length = 0.0
        has_geometry = False
        settings = ifcopenshell.geom.settings()
        try:
            shape = ifcopenshell.geom.create_shape(settings, beam)
            if shape:
                has_geometry = True
                volume, width, height, length = calculate_volume_and_dimensions(shape.geometry)
                # Конвертация из метров в миллиметры
                width *= 1000
                height *= 1000
                length *= 1000
        except Exception as e:
            print(f"Ошибка при обработке балки {beam_name}: {e}", file=sys.stderr)

        # Сохраняем информацию о балке
        beam_data = {
            'name': beam_name,
            'type': beam_type,
            'description': description,
            'materials': materials,
            'volume': volume,
            'width': width,
            'height': height,
            'length': length,
            'level': level,
            'elevation': elevation,
            'has_geometry': has_geometry,
            'global_id': getattr(beam, 'GlobalId', 'N/A')
        }
        beams_info.append(beam_data)

        # Статистика по типам
        type_stats[beam_type]['count'] += 1
        type_stats[beam_type]['total_volume'] += volume

        # Статистика по этажам
        level_stats[level]['count'] += 1
        level_stats[level]['types'].add(beam_type)
        level_stats[level]['beams'].append(beam_data)
        if elevation is not None:
            level_stats[level]['elevation'] = elevation
        level_stats[level]['total_volume'] += volume

    return {
        'beams': beams_info,
        'type_stats': dict(type_stats),
        'level_stats': dict(level_stats),
        'total_count': len(beams_info),
        'total_volume': sum(beam['volume'] for beam in beams_info)
    }


def main():
    if len(sys.argv) < 2:
        print("Error: No IFC file path provided", file=sys.stderr)
        sys.exit(1)
    model_path = sys.argv[1]
    try:
        ifc_file = ifcopenshell.open(model_path)
        # Анализ файла
        analysis = get_beams_analysis(ifc_file)

        # Вывод результатов
        print(f"\nОбщее количество балок: {analysis['total_count']}")
        print(f"Общий объем всех балок: {analysis['total_volume']:.3f} м³\n")

        # Детализированный вывод по уровням
        for level, stats in sorted(analysis['level_stats'].items()):
            for i, beam in enumerate(stats['beams'], 1):
                beam_elevation = f"{beam['elevation']:.2f}" if beam['elevation'] is not None else "N/A"
                print(f"\n  Балка {i}:")
                print(f"    Название: {beam['name']}")
                print(f"    GlobalId: {beam['global_id']}")
                print(f"    Тип: {beam['type']}")
                print(f"    Материалы: {', '.join(beam['materials']) if beam['materials'] else 'N/A'}")
                print(f"    Ширина: {beam['width']:.1f} мм")
                print(f"    Высота: {beam['height']:.1f} мм")
                print(f"    Длина: {beam['length']:.1f} мм")
                print(f"    Объем: {beam['volume']:.3f} м³")
                print(f"    Уровень: {level}")
                print(f"    Отметка уровня: {beam_elevation} м")
                print(f"    Геометрия: {'Есть' if beam['has_geometry'] else 'Нет'}")

    except Exception as e:
        print(f"Error processing IFC file: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
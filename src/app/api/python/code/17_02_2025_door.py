import ifcopenshell
import ifcopenshell.geom
import re
from collections import defaultdict
import sys


def extract_dimensions_from_object_type(object_type):
    """Извлекает размеры из строки ObjectType."""
    if not object_type:
        return None, None

    # Ищем размеры в форматах: 800x2100, 800*2100, 800 X 2100
    match = re.search(r'(\d+)\s*[xX*]\s*(\d+)', object_type)
    if match:
        return float(match.group(1)), float(match.group(2))

    # Дополнительные форматы для извлечения размеров
    match = re.search(r'(\d+)\s*[шШШирина]\s*(\d+)\s*[вВВысота]', object_type)
    if match:
        return float(match.group(1)), float(match.group(2))

    return None, None

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
def get_doors_analysis(ifc_file):
    """Анализирует двери с группировкой по типам и этажам."""
    doors_info = []
    type_stats = defaultdict(lambda: {'count': 0, 'total_area': 0})
    level_stats = defaultdict(lambda: {
        'count': 0,
        'types': set(),
        'doors': [],
        'total_area': 0
    })

    doors = ifc_file.by_type('IfcDoor')

    for door in doors:
        # Основные свойства
        door_name = getattr(door, 'Name', 'Unnamed Door')
        door_type = getattr(door, 'ObjectType', 'N/A')
        width, height = extract_dimensions_from_object_type(door_type)

        # Определение уровня (этажа)
        level = 'Unknown Level'
        elevation = None
        for rel in getattr(door, 'ContainedInStructure', []):
            if rel.is_a('IfcRelContainedInSpatialStructure'):
                level_obj = rel.RelatingStructure
                level = getattr(rel.RelatingStructure, 'Name', 'Unknown Level')
                elevation = get_level_elevation(level_obj)
                break

        # Проверка геометрии
        has_geometry = False
        settings = ifcopenshell.geom.settings()
        try:
            if ifcopenshell.geom.create_shape(settings, door):
                has_geometry = True
        except:
            pass

        # Расчет площади (если известны размеры)
        area = width * height / 1000000 if width and height else None  # в м²

        # Сохраняем информацию о двери
        if width or height:
            door_data = {
                'name': door_name,
                'type': door_type,
                'width': width,
                'height': height,
                'area': area,
                'level': level,
                'elevation': elevation,
                'has_geometry': has_geometry,
                'global_id': getattr(door, 'GlobalId', 'N/A')
            }
            doors_info.append(door_data)

            # Статистика по типам
            type_stats[door_type]['count'] += 1
            if area:
                type_stats[door_type]['total_area'] += area

            # Статистика по этажам
            level_stats[level]['count'] += 1
            level_stats[level]['types'].add(door_type)
            level_stats[level]['doors'].append(door_data)
            if elevation is not None:
                level_stats[level]['elevation'] = elevation
            if area:
                level_stats[level]['total_area'] += area

    return {
        'doors': doors_info,
        'type_stats': dict(type_stats),
        'level_stats': dict(level_stats),
        'total_count': len(doors_info)
    }





def main():
    if len(sys.argv) < 2:
        print("Error: No IFC file path provided", file=sys.stderr)
        sys.exit(1)
    model_path = sys.argv[1]
    try:
        ifc_file = ifcopenshell.open(model_path)
        # Анализ файла
        analysis = get_doors_analysis(ifc_file)

        # Вывод результатов
        print(f"\nОбщее количество дверей: {analysis['total_count']}")

        # print("\nРаспределение по типам:")
        # for door_type, stats in sorted(analysis['type_stats'].items()):
        #     print(f"\nТип: {door_type}")
        #     print(f"  Количество: {stats['count']}")
        #     if stats['total_area'] > 0:
        #         print(f"  Общая площадь: {stats['total_area']:.2f} м²")

        # Детализированный вывод по этажам
        # print("\nДетализированная информация по этажам:")
        for level, stats in sorted(analysis['level_stats'].items()):
            # print(f"\n=== Этаж: {level} ===")
            # print(f"Всего дверей: {stats['count']}")
            # print(f"Общая площадь дверей: {stats['total_area']:.2f} м²")
            # print(f"Типы дверей: {', '.join(stats['types']) if stats['types'] else 'N/A'}")

            # print("\nСписок дверей на этаже:")
            for i, door in enumerate(stats['doors'], 1):
                door_elevation = f"{door['elevation']:.2f}" if door['elevation'] is not None else "N/A"
                print(f"\n  Дверь {i}:")
                print(f"    Название: {door['name']}")
                print(f"    GlobalId: {door['global_id']}")
                print(f"    Тип: {door['type']}")
                print(f"    Уровень: {level}")
                print(f"    Отметка уровня: {door_elevation} м")
                if door['width'] and door['height']:
                    print(f"    Ширина: {door['width']}")
                    print(f"    Высота: {door['height']}")
                    print(f"    Площадь: {door['area']:.2f} м²")
                else:
                    print("    Размеры: N/A")
                print(f"    Геометрия: {'Есть' if door['has_geometry'] else 'Нет'}")

            # print(f"\nИтого на этаже '{level}': {stats['count']} дверей, {stats['total_area']:.2f} м²")

        # Общая сводка
        # print("\n=== ОБЩАЯ СВОДКА ===")
        # print(f"Всего дверей в проекте: {analysis['total_count']}")
        # print("Распределение по этажам:")
        # for level, stats in sorted(analysis['level_stats'].items()):
        #     print(f"  {level}: {stats['count']} дверей ({stats['total_area']:.2f} м²)")
    except Exception as e:
        print(f"Error processing IFC file: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
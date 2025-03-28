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
    match = re.search(r'(\d+)\s*[xXхХ*]\s*(\d+)', object_type)
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


def get_windows_analysis(ifc_file):
    """Анализирует окна с группировкой по типам и этажам."""
    windows_info = []
    type_stats = defaultdict(lambda: {'count': 0, 'total_area': 0})
    level_stats = defaultdict(lambda: {
        'count': 0,
        'types': set(),
        'windows': [],
        'total_area': 0
    })

    windows = ifc_file.by_type('IfcWindow')

    for window in windows:
        # Основные свойства
        window_name = getattr(window, 'Name', 'Unnamed Window')
        window_type = getattr(window, 'ObjectType', 'N/A')
        width, height = extract_dimensions_from_object_type(window_type)
        description = getattr(window, 'Description', 'N/A')

        # Определение уровня (этажа)
        level = 'Unknown Level'
        elevation = None
        for rel in getattr(window, 'ContainedInStructure', []):
            if rel.is_a('IfcRelContainedInSpatialStructure'):
                level_obj = rel.RelatingStructure
                level = getattr(rel.RelatingStructure, 'Name', 'Unknown Level')
                elevation = get_level_elevation(level_obj)
                break

        # Проверка геометрии
        has_geometry = False
        settings = ifcopenshell.geom.settings()
        try:
            if ifcopenshell.geom.create_shape(settings, window):
                has_geometry = True
        except:
            pass

        # Расчет площади (если известны размеры)
        area = width * height / 1000000 if width and height else None  # в м²

        # Сохраняем информацию об окне
        if width or height:
            window_data = {
                'name': window_name,
                'type': window_type,
                'description': description,
                'width': width,
                'height': height,
                'area': area,
                'level': level,
                'elevation': elevation,
                'has_geometry': has_geometry,
                'global_id': getattr(window, 'GlobalId', 'N/A')
            }
            windows_info.append(window_data)

            # Статистика по типам
            type_stats[window_type]['count'] += 1
            if area:
                type_stats[window_type]['total_area'] += area

            # Статистика по этажам
            level_stats[level]['count'] += 1
            level_stats[level]['types'].add(window_type)
            level_stats[level]['windows'].append(window_data)
            if elevation is not None:
                level_stats[level]['elevation'] = elevation
            if area:
                level_stats[level]['total_area'] += area

    return {
        'windows': windows_info,
        'type_stats': dict(type_stats),
        'level_stats': dict(level_stats),
        'total_count': len(windows_info)
    }


def main():
    if len(sys.argv) < 2:
        print("Error: No IFC file path provided", file=sys.stderr)
        sys.exit(1)
    model_path = sys.argv[1]
    try:
        ifc_file = ifcopenshell.open(model_path)
        # Анализ файла
        analysis = get_windows_analysis(ifc_file)

        # Вывод результатов
        print(f"\nОбщее количество окон: {analysis['total_count']}")

        # Детализированный вывод по этажам
        for level, stats in sorted(analysis['level_stats'].items()):
            # print(f"\n=== Уровень: {level} ===")
            print(f"Всего окон: {stats['count']}")
            if stats['total_area'] > 0:
                print(f"Общая площадь окон: {stats['total_area']:.2f} м²")
            # print(f"Типы окон: {', '.join(stats['types']) if stats['types'] else 'N/A'}")

            print("\nСписок окон на уровне:")
            for i, window in enumerate(stats['windows'], 1):
                window_elevation = f"{window['elevation']:.2f}" if window['elevation'] is not None else "N/A"
                print(f"\n  Окно {i}:")
                print(f"    Название: {window['name']}")
                print(f"    GlobalId: {window['global_id']}")
                print(f"    Тип: {window['type']}")
                print(f"    Описание: {window['description']}")
                print(f"    Уровень: {level}")
                print(f"    Отметка уровня: {window_elevation} м")
                if window['width'] and window['height']:
                    print(f"    Ширина: {window['width']} мм")
                    print(f"    Высота: {window['height']} мм")
                    if window['area']:
                        print(f"    Площадь: {window['area']:.2f} м²")
                else:
                    print("    Размеры: N/A")
                print(f"    Геометрия: {'Есть' if window['has_geometry'] else 'Нет'}")

            print(f"\nИтого на уровне '{level}': {stats['count']} окон", end="")
            if stats['total_area'] > 0:
                print(f", {stats['total_area']:.2f} м²")
            else:
                print()

        # Общая сводка
        # print("\n=== ОБЩАЯ СВОДКА ===")
        # print(f"Всего окон в проекте: {analysis['total_count']}")
        # print("Распределение по уровням:")
        # for level, stats in sorted(analysis['level_stats'].items()):
        #     print(f"  {level}: {stats['count']} окон", end="")
        #     if stats['total_area'] > 0:
        #         print(f" ({stats['total_area']:.2f} м²)")
        #     else:
        #         print()

    except Exception as e:
        print(f"Error processing IFC file: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
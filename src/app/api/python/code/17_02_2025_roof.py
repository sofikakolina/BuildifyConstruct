import ifcopenshell
import ifcopenshell.geom
import numpy as np
from collections import defaultdict


def calculate_roof_area(geometry):
    """Вычисляет площадь крыши по ее геометрии."""
    verts = np.array(geometry.verts).reshape(-1, 3)
    faces = np.array(geometry.faces).reshape(-1, 3)
    total_area = 0.0

    for face in faces:
        v0, v1, v2 = verts[face]
        # Вычисляем площадь треугольника через векторное произведение
        cross = np.cross(v1 - v0, v2 - v0)
        area = 0.5 * np.linalg.norm(cross)
        total_area += area

    return total_area


def get_roof_analysis(ifc_file):
    """Анализирует крыши с группировкой по уровням, типам и материалам."""
    roofs_info = []
    level_stats = defaultdict(lambda: {
        'count': 0,
        'total_area': 0,
        'types': defaultdict(int),
        'materials': defaultdict(int),
        'roofs': []
    })

    roofs = ifc_file.by_type('IfcRoof')

    for roof in roofs:
        # Основные свойства
        roof_name = getattr(roof, 'Name', 'Unnamed Roof')
        roof_type = getattr(roof, 'ObjectType', 'N/A')

        # Определение уровня (этажа)
        level = 'Unknown Level'
        for rel in getattr(roof, 'ContainedInStructure', []):
            if rel.is_a('IfcRelContainedInSpatialStructure'):
                level = getattr(rel.RelatingStructure, 'Name', 'Unknown Level')
                break

        # Извлечение материалов
        materials = []
        for rel in getattr(roof, 'HasAssociations', []):
            if rel.is_a('IfcRelAssociatesMaterial'):
                material = rel.RelatingMaterial
                if material.is_a('IfcMaterial'):
                    materials.append(material.Name)
                elif material.is_a('IfcMaterialLayerSet'):
                    for layer in material.MaterialLayers:
                        if hasattr(layer, 'Material'):
                            materials.append(layer.Material.Name)

        # Расчет площади через геометрию
        area = 0.0
        settings = ifcopenshell.geom.settings()
        try:
            shape = ifcopenshell.geom.create_shape(settings, roof)
            if shape:
                area = calculate_roof_area(shape.geometry)
        except Exception as e:
            print(f"Ошибка обработки крыши {roof_name}: {e}")
            continue

        roof_data = {
            'name': roof_name,
            'type': roof_type,
            'materials': materials,
            'area': area,
            'global_id': getattr(roof, 'GlobalId', 'N/A'),
            'level': level
        }

        # Обновляем статистику по уровням
        level_stats[level]['count'] += 1
        level_stats[level]['total_area'] += area
        level_stats[level]['types'][roof_type] += 1
        for material in materials:
            level_stats[level]['materials'][material] += 1
        level_stats[level]['roofs'].append(roof_data)

    return {
        'level_stats': dict(level_stats),
        'total_count': len(roofs),
        'total_area': sum(level['total_area'] for level in level_stats.values())
    }


ifc_file = ifcopenshell.open('models/КолдинТЭ_2-2_revit.ifc')
analysis = get_roof_analysis(ifc_file)

# Вывод результатов
print(f"\nОбщее количество крыш: {analysis['total_count']}")
print(f"Общая площадь крыш: {analysis['total_area']:.2f} м²")

# Детализированный вывод по уровням
print("\nДетализация по уровням:")
for level, stats in sorted(analysis['level_stats'].items()):
    print(f"\n=== Уровень: {level} ===")
    print(f"Количество крыш: {stats['count']}")
    print(f"Общая площадь: {stats['total_area']:.2f} м²")

    print("\nТипы крыш:")
    for roof_type, count in stats['types'].items():
        print(f"  {roof_type}: {count} шт.")

    print("\nМатериалы:")
    for material, count in stats['materials'].items():
        print(f"  {material}: {count} применений")

    print("\nСписок крыш:")
    for i, roof in enumerate(stats['roofs'], 1):
        print(f"\n  Крыша {i}:")
        print(f"    Название: {roof['name']}")
        print(f"    GlobalId: {roof['global_id']}")
        print(f"    Тип: {roof['type']}")
        print(f"    Площадь: {roof['area']:.2f} м²")
        print(f"    Материалы: {', '.join(roof['materials']) if roof['materials'] else 'N/A'}")

# Сводная таблица
print("\n=== СВОДНАЯ ТАБЛИЦА ===")
print(f"{'Уровень':<20} {'Кол-во':<10} {'Площадь (м²)':<15} {'Основные материалы'}")
print("-" * 60)
for level, stats in sorted(analysis['level_stats'].items()):
    main_materials = ', '.join(list(stats['materials'].keys())[:3]) + ('...' if len(stats['materials']) > 3 else '')
    print(f"{level:<20} {stats['count']:<10} {stats['total_area']:<15.2f} {main_materials}")
import ifcopenshell
from collections import defaultdict
import ifcopenshell.geom


def get_level_name(element):
    """Получает название уровня для элемента."""
    for rel in getattr(element, 'ContainedInStructure', []):
        if rel.is_a('IfcRelContainedInSpatialStructure'):
            return getattr(rel.RelatingStructure, 'Name', 'Unknown Level')
    return 'Unknown Level'


def calculate_concrete_volume_for_stairs(ifc_file):
    """Анализирует лестницы и перила с группировкой по уровням."""
    level_stats = defaultdict(lambda: {
        'stairs': [],
        'railings': [],
        'total_stair_volume': 0.0
    })

    # Обработка перил
    railings = ifc_file.by_type('IfcRailing')
    for railing in railings:
        railing_data = {
            'name': getattr(railing, 'Name', 'Unnamed Railing'),
            'global_id': getattr(railing, 'GlobalId', 'N/A'),
            'parameters': {
                'Length': 1000,  # мм (значения по умолчанию)
                'Height': 900,
                'Material': 'Не указан'
            }
        }

        for rel in railing.IsDefinedBy:
            if rel.is_a('IfcRelDefinesByProperties'):
                pset = rel.RelatingPropertyDefinition
                if pset.is_a('IfcPropertySet') and pset.Name == 'Pset_RailingCommon':
                    for prop in pset.HasProperties:
                        if prop.Name in railing_data['parameters'] and prop.NominalValue:
                            railing_data['parameters'][prop.Name] = prop.NominalValue.wrappedValue

        level = get_level_name(railing)
        level_stats[level]['railings'].append(railing_data)

    return level_stats


ifc_file = ifcopenshell.open('models/КолдинТЭ_2-2_revit.ifc')
level_stats = calculate_concrete_volume_for_stairs(ifc_file)

# Вывод результатов
print("Анализ перил по уровням:")
for level, stats in sorted(level_stats.items()):
    print(f"\n=== Уровень: {level} ===")

    # Перила
    print(f"\nПерила ({len(stats['railings'])} шт.):")
    for i, railing in enumerate(stats['railings'], 1):
        print(f"\n  Перила {i}:")
        print(f"    Название: {railing['name']}")
        print(f"    GlobalId: {railing['global_id']}")
        print(f"    Длина: {railing['parameters']['Length']} мм")
        print(f"    Высота: {railing['parameters']['Height']} мм")
        print(f"    Материал: {railing['parameters']['Material']}")

# Сводная информация
print("\n=== СВОДНАЯ ИНФОРМАЦИЯ ===")
print(f"{'Уровень':<20} {'Перил':<10} {'Объем бетона (м³)':<15}")
print("-" * 60)
for level, stats in sorted(level_stats.items()):
    print(f"{level:<20} {len(stats['railings']):<10} {stats['total_stair_volume']:<15.3f}")
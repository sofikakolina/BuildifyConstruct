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

    # Обработка лестниц
    # stairs = ifc_file.by_type('IfcStair') + ifc_file.by_type('IfcStairFlight')
    stairs = ifc_file.by_type('IfcStair')
    for stair in stairs:

        stair_data = {
            'name': getattr(stair, 'Name', 'Unnamed Stair'),
            'global_id': getattr(stair, 'GlobalId', 'N/A'),
            'parameters': {}
        }

        # Извлечение параметров
        params = {
            'TreadLength': 280,  # мм (значения по умолчанию)
            'RiserHeight': 172.63,
            'NumberOfTreads': 10,
            'Width': 1000
        }

        for rel in stair.IsDefinedBy:
            if rel.is_a('IfcRelDefinesByProperties'):
                pset = rel.RelatingPropertyDefinition
                if pset.is_a('IfcPropertySet') and pset.Name == 'Pset_StairCommon':
                    for prop in pset.HasProperties:
                        if prop.Name in params and prop.NominalValue:
                            params[prop.Name] = prop.NominalValue.wrappedValue

        # Расчет объема
        volume = (params['TreadLength'] * params['Width'] *
                  params['RiserHeight'] * params['NumberOfTreads']) / 1e9  # в м³

        stair_data['parameters'] = params
        stair_data['volume'] = volume
        level = get_level_name(stair)

        level_stats[level]['stairs'].append(stair_data)
        level_stats[level]['total_stair_volume'] += volume

    return level_stats


ifc_file = ifcopenshell.open('models/КолдинТЭ_2-2_revit.ifc')
level_stats = calculate_concrete_volume_for_stairs(ifc_file)

# Вывод результатов
print("Анализ лестниц по уровням:")
for level, stats in sorted(level_stats.items()):
    print(f"\n=== Уровень: {level} ===")

    # Лестницы
    print(f"\nЛестницы ({len(stats['stairs'])} шт.):")
    print(f"Общий объем бетона: {stats['total_stair_volume']:.3f} м³")
    for i, stair in enumerate(stats['stairs'], 1):
        print(f"\n  Лестница {i}:")
        print(f"    Название: {stair['name']}")
        print(f"    GlobalId: {stair['global_id']}")
        print(f"    Длина ступени: {stair['parameters']['TreadLength']} мм")
        print(f"    Высота подступенка: {stair['parameters']['RiserHeight']} мм")
        print(f"    Количество ступеней: {stair['parameters']['NumberOfTreads']}")
        print(f"    Ширина: {stair['parameters']['Width']} мм")
        print(f"    Объем бетона: {stair['volume']:.3f} м³")


# Сводная информация
print("\n=== СВОДНАЯ ИНФОРМАЦИЯ ===")
print(f"{'Уровень':<20} {'Лестниц':<10} {'Объем бетона (м³)':<15}")
print("-" * 60)
for level, stats in sorted(level_stats.items()):
    print(f"{level:<20} {len(stats['stairs']):<10} {stats['total_stair_volume']:<15.3f}")
# -*- coding: utf-8 -*-
with open('top-arena-3d.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 找到第764行（索引763）并修改
for i, line in enumerate(lines):
    if i == 763 and 'if (!top.isEnemy)' in line:  # 第764行
        # 替换这一行
        lines[i] = line.replace('if (!top.isEnemy)', 'if (top.isEnemy) {\n            // 敌方：名称显示在头顶上方（血条上方）\n            ctx.fillStyle = \'#f87171\'; // 红色调\n            ctx.strokeText(displayName, top.x, top.y - top.radius - 25);\n            ctx.fillText(displayName, top.x, top.y - top.radius - 25);\n        } else {\n            // 我方：名称显示在底座下方')
        print(f'修改了第{i+1}行')
        break

with open('top-arena-3d.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('完成')

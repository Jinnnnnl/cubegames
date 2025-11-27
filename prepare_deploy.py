#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
腾讯云Studio部署准备脚本
"""

import os
import shutil
import zipfile
from datetime import datetime

def create_deploy_package():
    """创建部署包"""
    
    # 创建部署文件夹
    deploy_dir = "deploy_package"
    if os.path.exists(deploy_dir):
        shutil.rmtree(deploy_dir)
    os.makedirs(deploy_dir)
    
    # 需要包含的文件和文件夹
    files_to_include = [
        "index.html",
        "css/",
        "js/",
        "assets/",
        "README.md"
    ]
    
    # 复制文件
    for item in files_to_include:
        src_path = item
        dst_path = os.path.join(deploy_dir, item)
        
        if os.path.exists(src_path):
            if os.path.isdir(src_path):
                shutil.copytree(src_path, dst_path)
                print(f"✓ 复制文件夹: {src_path}")
            else:
                os.makedirs(os.path.dirname(dst_path), exist_ok=True)
                shutil.copy2(src_path, dst_path)
                print(f"✓ 复制文件: {src_path}")
        else:
            print(f"⚠ 文件不存在: {src_path}")
    
    # 创建zip包
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    zip_filename = f"game_deploy_{timestamp}.zip"
    
    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(deploy_dir):
            for file in files:
                file_path = os.path.join(root, file)
                arc_path = os.path.relpath(file_path, deploy_dir)
                zipf.write(file_path, arc_path)
    
    print(f"\n✓ 部署包已创建: {zip_filename}")
    print(f"✓ 临时文件夹: {deploy_dir}")
    
    # 显示包含的文件
    print("\n📦 部署包内容:")
    with zipfile.ZipFile(zip_filename, 'r') as zipf:
        for name in sorted(zipf.namelist()):
            print(f"  - {name}")
    
    return zip_filename, deploy_dir

if __name__ == "__main__":
    print("🚀 准备腾讯云Studio部署包...")
    zip_file, temp_dir = create_deploy_package()
    
    print(f"\n📋 部署步骤:")
    print(f"1. 下载部署包: {zip_file}")
    print(f"2. 登录腾讯云Studio")
    print(f"3. 上传并解压到项目目录")
    print(f"4. 测试游戏功能")
    
    print(f"\n🧹 清理临时文件:")
    print(f"可以删除临时文件夹: {temp_dir}")
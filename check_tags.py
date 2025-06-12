#!/usr/bin/env python3
import re
import argparse
import os
import sys

def check_html_tags(filename):
    # Проверяем существование файла
    if not os.path.exists(filename):
        print(f"Ошибка: Файл '{filename}' не найден!")
        sys.exit(1)
        
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Найти все теги
    opening_tags = re.findall(r'<([a-zA-Z][a-zA-Z0-9]*)[^>]*>', content)
    closing_tags = re.findall(r'</([a-zA-Z][a-zA-Z0-9]*)>', content)
    self_closing = re.findall(r'<([a-zA-Z][a-zA-Z0-9]*)[^>]*/>', content)
    
    # Исключаем self-closing теги
    valid_tags = ['div', 'main', 'nav', 'section', 'form', 'button', 'a', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'svg', 'path']
    
    opening_count = {}
    closing_count = {}
    
    for tag in opening_tags:
        if tag.lower() in valid_tags:
            opening_count[tag.lower()] = opening_count.get(tag.lower(), 0) + 1
    
    for tag in closing_tags:
        if tag.lower() in valid_tags:
            closing_count[tag.lower()] = closing_count.get(tag.lower(), 0) + 1
    
    print(f"Анализ тегов для файла: {filename}")
    print("=" * 40)
    
    all_tags = set(opening_count.keys()) | set(closing_count.keys())
    
    for tag in sorted(all_tags):
        open_c = opening_count.get(tag, 0)
        close_c = closing_count.get(tag, 0)
        if open_c != close_c:
            print(f"{tag:10}: {open_c:3} открыт / {close_c:3} закрыт ❌ (разница: {open_c - close_c:+3})")
        else:
            print(f"{tag:10}: {open_c:3} открыт / {close_c:3} закрыт ✅")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Проверка парности HTML тегов')
    parser.add_argument('file', help='Путь к HTML файлу для проверки')
    
    args = parser.parse_args()
    check_html_tags(args.file) 

import http.server
import socketserver
import os
import sys
from urllib.parse import urlparse, unquote

# 默认端口
PORT = 8000

# 获取当前脚本所在目录
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def do_GET(self):
        # 解析请求路径
        parsed_path = urlparse(self.path)
        path = unquote(parsed_path.path)
        
        # 如果请求根路径，重定向到index.html
        if path == '/':
            self.path = '/index.html'
        
        # 处理assets路径
        if path.startswith('/assets/'):
            # 从assets目录提供文件
            file_path = path[1:]  # 移除开头的斜杠
            
            # 检查文件是否存在
            if not os.path.exists(file_path):
                # 尝试从CodeBubbyAssets目录获取
                alt_path = os.path.join('assets', 'CodeBubbyAssets', '2_2', os.path.basename(path))
                if os.path.exists(alt_path):
                    self.path = '/' + alt_path
        
        return super().do_GET()
    
    def log_message(self, format, *args):
        # 自定义日志格式
        sys.stderr.write("[%s] %s\n" % (self.log_date_time_string(), format % args))

def run_server(port=PORT):
    try:
        # 创建目录结构
        if not os.path.exists('assets'):
            os.makedirs('assets')
        
        # 创建服务器
        with socketserver.TCPServer(("", port), CustomHTTPRequestHandler) as httpd:
            print(f"服务器启动在 http://localhost:{port}")
            print(f"按 Ctrl+C 停止服务器")
            
            # 启动服务器
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n服务器已停止")
    except Exception as e:
        print(f"启动服务器时出错: {e}")

if __name__ == "__main__":
    run_server()

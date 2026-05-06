import subprocess
import os

try:
    # Change to frontend directory
    os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'frontend'))
    
    # Run npm run build
    result = subprocess.run(['npm', 'run', 'build'], capture_output=True, text=True, shell=True)
    
    with open('build_output.txt', 'w') as f:
        f.write("=== STDOUT ===\n")
        f.write(result.stdout)
        f.write("\n=== STDERR ===\n")
        f.write(result.stderr)
        
    print("Build finished, check frontend/build_output.txt")
except Exception as e:
    print("Error:", str(e))

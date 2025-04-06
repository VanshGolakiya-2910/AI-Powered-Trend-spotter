import subprocess 

def run_script(path):
    print(f'Running : {path}')
    result = subprocess.run(['python',path],capture_output=True,text=True)
    print(result.stdout)
    if result.stderr:
        print("Error:",result.stderr)


if __name__ =='__main__':
    scripts = [
        "scraper/Scraper_1.py",
        "nlp/TopicModeling-2.py"
    ]

    for script in scripts:
        run_script(script)
    
    print('----------------All script has been executed succesfully-----------------')
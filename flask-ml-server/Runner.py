import subprocess 

def run_script(path):
    print(f'Running : {path}')
    result = subprocess.run(['python',path],capture_output=True,text=True)
    print(result.stdout)
    if result.stderr:
        print("Error:",result.stderr)


if __name__ =='__main__':
    scripts = [
        "flask-ml-server/scraper/Scraper_1.py",
        "flask-ml-server/nlp/TopicModeling-2.py",
        "flask-ml-server/model/Future_Trend_prediction.py"
    ]

    for script in scripts:
        run_script(script)
    
    print('----------------All script has been executed succesfully-----------------')
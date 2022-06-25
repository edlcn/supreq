from bs4 import BeautifulSoup
import requests

def link_maker(course):
    domain_number = course.split(" ")
    return "https://suis.sabanciuniv.edu/prod/bwckctlg.p_disp_course_detail?cat_term_in=202201&subj_code_in={}&crse_numb_in={}".format(domain_number[0],domain_number[1])

def extract_preq(sentence):
    theChain = ""
    data = sentence.strip().split(" ")
    current_index = 0
    and_count = 0
    or_count = 0
    for x in data:
        if x == "":
            current_index += 1
            continue
        
        if x == "or":
            theChain += "| "
            or_count += 1
            
        elif x == "and":
            theChain += "& "
            and_count += 1
            
        elif x[0] == "(":
            theChain += "( "
            
        elif x[len(x)-1] == ")":
            theChain += ") "
            
        elif x == "level":
            courseName = data[current_index+2] + data[current_index+3]
            theChain += courseName + " "
            
        current_index += 1

    if and_count == 0 or or_count == 0:
        theChain = theChain.replace("(", "").replace(")","")
    return theChain

def find_preq(course):
    
    url = link_maker(course)
    html_version = requests.get(url).text
    bs = BeautifulSoup(html_version,"html.parser")
    res = bs.find(class_ = "ntdefault").getText().split("Prerequisites:")  #This is due to bad design of the website
    if len(res) == 1:
        return "None"
    
    preqs = extract_preq(res[1])
    
    if preqs == "":
        return "None"
    
    return preqs
    


with open("Catalog Entries.html","r",encoding = "utf-8") as file:
    doc = BeautifulSoup(file,"html.parser")

links = doc.find_all(class_ = "nttitle")
course_names = [x.getText().split("-")[0].strip() for x in links]


with open("pure_result.txt","w") as pr:
    for x in course_names:
        if x[len(x)-1].isalpha() or x == "HIST 636" or x == "HIST 637" or x == "HIST 638":
            continue

        preqs = find_preq(x)
        pr.write("{}:{}\n".format(x.replace(" ",""),preqs.strip()))
        
    
    





import requests
try:
    resp = requests.get("http://localhost:8000/api/assignments/")
    print(f"Status: {resp.status_code}")
    if resp.status_code == 200:
        data = resp.json()
        print(f"Count: {len(data)}")
        if len(data) > 0:
            print("Sample:", data[0])
    else:
        print("Response:", resp.text)
except Exception as e:
    print(e)

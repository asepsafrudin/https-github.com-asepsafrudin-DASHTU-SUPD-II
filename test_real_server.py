import requests

url = "http://localhost:8003/api/dokumentasi/"
data = {
    "judul_kegiatan": "test_real",
    "tanggal_kegiatan": "2026-07-16",
    "lokasi": "test",
    "kategori": "test",
    "uploader": "test"
}
files = {
    "file": ("test.txt", b"hello world", "text/plain")
}
response = requests.post(url, data=data, files=files)
print("STATUS", response.status_code)
print("TEXT", response.text)

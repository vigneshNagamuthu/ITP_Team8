import subprocess

# Destination IPs and interface details
routes = {
    "103.102.166.224": {"iface": "wlp87s0f0", "table": "wifi", "table_id": 100, "gateway": "10.130.13.1"},
    "20.205.243.166":  {"iface": "eth0",     "table": "eth",  "table_id": 101, "gateway": "192.168.2.1"}
}

def run(cmd):
    print(f"$ {cmd}")
    subprocess.run(cmd, shell=True, check=True)

def ensure_table(name, table_id):
    path = "/etc/iproute2/rt_tables"
    with open(path, "r+") as f:
        lines = f.read().splitlines()
        if not any(name in line for line in lines):
            f.write(f"{table_id} {name}\n")

def setup():
    for ip, cfg in routes.items():
        iface = cfg["iface"]
        table = cfg["table"]
        table_id = cfg["table_id"]
        gw = cfg["gateway"]

        ensure_table(table, table_id)
        run(f"ip route add default via {gw} dev {iface} table {table}")
        run(f"ip rule add to {ip} table {table}")

if __name__ == "__main__":
    try:
        setup()
        print("Routing rules set up successfully.")
    except subprocess.CalledProcessError as e:
        print("Error:", e)

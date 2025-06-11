package com.example.backend;

import org.springframework.web.bind.annotation.*;
import java.io.*;
import java.util.*;

@RestController
@CrossOrigin(origins = "*")
public class NetworkController {

    private final String IPERF3_SERVER_IP = "192.168.1.100"; // 🔁 Replace with your actual iperf3 server IP

    @GetMapping("/get-interfaces")
    public Map<String, Object> getInterfaces() {
        Map<String, Object> result = new HashMap<>();
        try {
            ProcessBuilder pb = new ProcessBuilder("bash", "-c", "ifconfig | grep -Eo '^[a-zA-Z0-9]+' | grep -v lo | head -n 2");
            Process process = pb.start();
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));

            List<String> ports = new ArrayList<>();
            String line;
            while ((line = reader.readLine()) != null) {
                ports.add(line.trim());
            }
            result.put("interfaces", ports);
        } catch (IOException e) {
            result.put("error", e.getMessage());
        }
        return result;
    }

    @GetMapping("/get-speed-data")
    public Map<String, Object> getSpeedData() {
        Map<String, Object> result = new HashMap<>();

        List<String> interfaces = getAvailableInterfaces();

        for (String iface : interfaces) {
            Map<String, String> data = runIperf3Test(iface);
            result.put(iface, data);
        }

        return result;
    }

    private List<String> getAvailableInterfaces() {
        List<String> interfaces = new ArrayList<>();
        try {
            ProcessBuilder pb = new ProcessBuilder("bash", "-c", "ifconfig | grep -Eo '^[a-zA-Z0-9]+' | grep -v lo | head -n 2");
            Process process = pb.start();
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line;
            while ((line = reader.readLine()) != null) {
                interfaces.add(line.trim());
            }
        } catch (IOException e) {
            interfaces.add("error: " + e.getMessage());
        }
        return interfaces;
    }

    private Map<String, String> runIperf3Test(String iface) {
        Map<String, String> result = new HashMap<>();
        try {
            String command = String.format("iperf3 -c %s -B $(ip addr show %s | grep 'inet ' | awk '{print $2}' | cut -d'/' -f1) -J", IPERF3_SERVER_IP, iface);
            ProcessBuilder pb = new ProcessBuilder("bash", "-c", command);
            Process process = pb.start();

            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            StringBuilder jsonOutput = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                jsonOutput.append(line).append("\n");
            }

            int exitCode = process.waitFor();
            if (exitCode == 0) {
                result.put("output", jsonOutput.toString());
            } else {
                result.put("error", "iperf3 failed with exit code " + exitCode);
            }
        } catch (IOException | InterruptedException e) {
            result.put("error", e.getMessage());
        }
        return result;
    }
}

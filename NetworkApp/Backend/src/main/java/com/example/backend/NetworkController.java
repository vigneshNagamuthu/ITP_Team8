package com.example.backend;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.*;
import java.io.*;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@CrossOrigin(origins = "*")
public class NetworkController {

    private final String IPERF3_SERVER_IP = "89.187.162.1";

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
    public Map<String, String> getSpeedData(@RequestParam String port, @RequestParam String mode) {
        Map<String, String> result = new HashMap<>();
        try {
            String ipCommand = String.format("ip addr show %s | grep 'inet ' | awk '{print $2}' | cut -d'/' -f1", port);
            Process ipProcess = new ProcessBuilder("bash", "-c", ipCommand).start();
            BufferedReader ipReader = new BufferedReader(new InputStreamReader(ipProcess.getInputStream()));
            String localIp = ipReader.readLine();
            if (localIp == null || localIp.isEmpty()) {
                result.put("output", "Could not get local IP for " + port);
                return result;
            }

            String command = String.format("iperf3 -c %s -B %s %s -J",
                    IPERF3_SERVER_IP, localIp, "download".equals(mode) ? "-R" : "");

            ProcessBuilder pb = new ProcessBuilder("bash", "-c", command);
            Process process = pb.start();
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            StringBuilder output = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }

            int exitCode = process.waitFor();
            if (exitCode == 0) {
                ObjectMapper mapper = new ObjectMapper();
                JsonNode root = mapper.readTree(output.toString());

                double bitsPerSecond = 0;
                if (root.has("end") && root.get("end").has("sum_sent")) {
                    bitsPerSecond = root.get("end").get("sum_sent").get("bits_per_second").asDouble();
                } else if (root.has("end") && root.get("end").has("sum_received")) {
                    bitsPerSecond = root.get("end").get("sum_received").get("bits_per_second").asDouble();
                }

                double mbps = bitsPerSecond / 1_000_000.0;
                result.put("bitrate", String.format("%.2f Mbps", mbps));
            } else {
                result.put("output", "iperf3 failed with exit code " + exitCode + "\n" + output.toString());
            }
        } catch (Exception e) {
            result.put("output", "Error: " + e.getMessage());
        }
        return result;
    }

    @GetMapping("/traffic-analysis")
public Map<String, Object> runTrafficAnalysis() {
    Map<String, Object> result = new HashMap<>();
    try {
        // Get the first interface from ifconfig (excluding lo)
        Process getInterfaceProcess = new ProcessBuilder(
            "bash", "-c", "ifconfig | grep -Eo '^[a-zA-Z0-9]+' | grep -v lo | head -n 1"
        ).start();
        BufferedReader ifaceReader = new BufferedReader(new InputStreamReader(getInterfaceProcess.getInputStream()));
        String interfaceName = ifaceReader.readLine();
        if (interfaceName == null || interfaceName.isEmpty()) {
            result.put("error", "No valid interface found.");
            return result;
        }

        // Run tcpdump for 5 seconds on selected interface
        String cmd = String.format("sudo timeout 5 tcpdump -i %s -vv -n", interfaceName);
        ProcessBuilder pb = new ProcessBuilder("bash", "-c", cmd);
        Process process = pb.start();

        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        List<String> destinations = new ArrayList<>();
        String line;
        while ((line = reader.readLine()) != null) {
            // Extract destination IP from line if possible
            // e.g., IP 192.168.1.5.12345 > 142.250.4.238.443:
            if (line.contains(" > ")) {
                String[] parts = line.split(" > ");
                if (parts.length > 1) {
                    String dest = parts[1].split(":")[0]; // Remove port if any
                    dest = dest.contains(".") ? dest : null;
                    if (dest != null && !destinations.contains(dest)) {
                        destinations.add(dest);
                    }
                }
            }
        }

        process.waitFor();
        result.put("interface", interfaceName);
        result.put("destinations", destinations);
    } catch (Exception e) {
        result.put("error", "Failed to run tcpdump: " + e.getMessage());
        e.printStackTrace();
    }
    return result;
}

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
public Map<String, Object> getSpeedData(@RequestParam String port, @RequestParam String mode) {
    Map<String, Object> result = new HashMap<>();
    try {
        // Get local IP bound to the selected interface
        String ipCommand = String.format("ip addr show %s | grep 'inet ' | awk '{print $2}' | cut -d'/' -f1", port);
        Process ipProcess = new ProcessBuilder("bash", "-c", ipCommand).start();
        BufferedReader ipReader = new BufferedReader(new InputStreamReader(ipProcess.getInputStream()));
        String localIp = ipReader.readLine();

        if (localIp == null || localIp.isEmpty()) {
            result.put("output", "Could not get local IP for " + port);
            return result;
        }

        // Build iperf3 command with optional reverse mode for download
        String command = String.format("iperf3 -c %s -B %s %s -J",
                IPERF3_SERVER_IP,
                localIp,
                "download".equals(mode) ? "-R" : "");

        Process process = new ProcessBuilder("bash", "-c", command).start();
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

            List<Double> series = new ArrayList<>();
            JsonNode intervals = root.get("intervals");

            if (intervals != null && intervals.isArray()) {
                for (JsonNode interval : intervals) {
                    double bps = 0;
                    if (interval.has("sum")) {
                        bps = interval.get("sum").get("bits_per_second").asDouble();
                    } else if (interval.has("sum_sent")) {
                        bps = interval.get("sum_sent").get("bits_per_second").asDouble();
                    } else if (interval.has("sum_received")) {
                        bps = interval.get("sum_received").get("bits_per_second").asDouble();
                    }
                    series.add(bps / 1_000_000.0); // Convert to Mbps
                }
            }

            double avg = series.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
            result.put("bitrate", String.format("%.2f Mbps", avg));
            result.put("series", series);
        } else {
            result.put("output", "iperf3 failed with exit code " + exitCode + "\n" + output.toString());
        }

    } catch (Exception e) {
        result.put("output", "Error: " + e.getMessage());
        e.printStackTrace();
    }
    return result;
}


    @GetMapping("/traffic-analysis")
public Map<String, Object> runTrafficAnalysis() {
    Map<String, Object> result = new HashMap<>();
    try {
        // Detect the first valid network interface (excluding loopback)
        Process getInterfaceProcess = new ProcessBuilder(
            "bash", "-c", "ifconfig | grep -Eo '^[a-zA-Z0-9]+' | grep -v lo | head -n 1"
        ).start();
        BufferedReader ifaceReader = new BufferedReader(new InputStreamReader(getInterfaceProcess.getInputStream()));
        String interfaceName = ifaceReader.readLine();
        if (interfaceName == null || interfaceName.isEmpty()) {
            result.put("error", "No valid interface found.");
            return result;
        }

        // Run tcpdump for 5 seconds without sudo
        String cmd = String.format("timeout 5 tcpdump -i %s -n", interfaceName);
        Process process = new ProcessBuilder("bash", "-c", cmd).start();

        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        Set<String> destinations = new HashSet<>();
        String line;
        while ((line = reader.readLine()) != null) {
            // Match pattern: "<source IP> > <destination IP>"
            if (line.contains(" > ")) {
                String[] parts = line.split(" > ");
                if (parts.length > 1) {
                    String dest = parts[1].split("\\s")[0]; // more general than colon
                    if (dest.matches("\\d+\\.\\d+\\.\\d+\\.\\d+.*")) {
                        dest = dest.split("\\.\\d+$")[0]; // Strip off port if needed
                        destinations.add(dest);
                    }
                }
            }
        }

        process.waitFor();
        result.put("interface", interfaceName);
        result.put("destinations", new ArrayList<>(destinations));
    } catch (Exception e) {
        result.put("error", "Failed to capture traffic: " + e.getMessage());
        e.printStackTrace();
    }
    return result;
}

}

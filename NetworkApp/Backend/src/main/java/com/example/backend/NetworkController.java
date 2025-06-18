package com.example.backend;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@CrossOrigin(origins = "*")
public class NetworkController {

    // Change this to your iperf3 server IP if not running locally
    private final String IPERF3_SERVER_IP = "127.0.0.1";

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
    public Map<String, String> getSpeedData(
            @RequestParam String port,
            @RequestParam String mode // "upload" or "download"
    ) {
        Map<String, String> result = new HashMap<>();
        try {
            // Get the local IP for the selected interface (port)
            String ipCommand = String.format("ip addr show %s | grep 'inet ' | awk '{print $2}' | cut -d'/' -f1", port);
            Process ipProcess = new ProcessBuilder("bash", "-c", ipCommand).start();
            BufferedReader ipReader = new BufferedReader(new InputStreamReader(ipProcess.getInputStream()));
            String localIp = ipReader.readLine();
            if (localIp == null || localIp.isEmpty()) {
                result.put("output", "Could not get local IP for " + port);
                return result;
            }

            // Build iperf3 command
            String command = String.format(
                "iperf3 -c %s -B %s %s -J",
                IPERF3_SERVER_IP,
                localIp,
                "download".equals(mode) ? "-R" : ""
            );

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
                // Parse iperf3 JSON and extract only the main interval bitrate
                try {
                    ObjectMapper mapper = new ObjectMapper();
                    JsonNode root = mapper.readTree(output.toString());

                    double bitsPerSecond = 0;
                    if (root.has("end") && root.get("end").has("sum_sent")) {
                        // Upload: client to server
                        bitsPerSecond = root.get("end").get("sum_sent").get("bits_per_second").asDouble();
                    } else if (root.has("end") && root.get("end").has("sum_received")) {
                        // Download: server to client (reverse)
                        bitsPerSecond = root.get("end").get("sum_received").get("bits_per_second").asDouble();
                    }
                    double mbps = bitsPerSecond / 1_000_000.0;

                    result.put("bitrate", String.format("%.2f Mbps", mbps));
                } catch (Exception e) {
                    result.put("output", "Error parsing iperf3 JSON: " + e.getMessage());
                }
            } else {
                result.put("output", "iperf3 failed with exit code " + exitCode + "\n" + output.toString());
            }
        } catch (Exception e) {
            result.put("output", "Error: " + e.getMessage());
        }
        return result;
    }
}

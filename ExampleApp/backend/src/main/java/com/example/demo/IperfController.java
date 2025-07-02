package com.example.demo;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class IperfController {

    private static final Logger logger = LoggerFactory.getLogger(IperfController.class);

    // DTO for request
    public static class IperfRequest {
        public List<String> interfaces;
    }

    // DTO for response speed data points
    public static class SpeedPoint {
        public int time;
        public double speed;  // Mbps

        public SpeedPoint(int time, double speed) {
            this.time = time;
            this.speed = speed;
        }
    }

    // DTO for interface iperf results
    public static class IperfResult {
        public String name;
        public List<SpeedPoint> data;

        public IperfResult(String name, List<SpeedPoint> data) {
            this.name = name;
            this.data = data;
        }
    }

    @PostMapping(value = "/iperf", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public List<IperfResult> runIperf(@RequestBody IperfRequest request) {
        List<IperfResult> results = new ArrayList<>();

        for (String ifaceName : request.interfaces) {
            try {
                String bindIp = getIPv4AddressForInterface(ifaceName);
                if (bindIp == null) {
                    logger.warn("Interface {} not found or has no IPv4 address, skipping", ifaceName);
                    results.add(new IperfResult(ifaceName, Collections.emptyList()));
                    continue;
                }

                logger.info("Running iperf3 on interface {} (bind IP {})", ifaceName, bindIp);

                ProcessBuilder pb = new ProcessBuilder(
                        "iperf3",
                        "-c", "89.187.162.1",   // Replace with your iperf3 server IP
                        "-B", bindIp,
                        "-t", "10",
                        "-i", "1"
                );
                pb.redirectErrorStream(true);
                Process process = pb.start();

                BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
                String line;
                List<SpeedPoint> speedPoints = new ArrayList<>();
                int timeCounter = 0;

                while ((line = reader.readLine()) != null) {
                    logger.info("iperf3 output line: {}", line);

                    if (line.contains("sec") && line.contains("Mbits/sec")) {
                        try {
                            String[] tokens = line.trim().split("\\s+");
                            for (int i = 0; i < tokens.length; i++) {
                                if (tokens[i].equals("Mbits/sec")) {
                                    double speed = Double.parseDouble(tokens[i - 1]);
                                    speedPoints.add(new SpeedPoint(timeCounter, speed));
                                    timeCounter++;
                                    break;
                                }
                            }
                        } catch (Exception e) {
                            logger.warn("Failed to parse iperf3 speed line: {}", line, e);
                        }
                    }
                }

                int exitCode = process.waitFor();
                logger.info("iperf3 process for interface {} exited with code {}", ifaceName, exitCode);

                results.add(new IperfResult(ifaceName, speedPoints));
            } catch (Exception e) {
                logger.error("Error running iperf3 on interface {}", ifaceName, e);
                results.add(new IperfResult(ifaceName, Collections.emptyList()));
            }
        }

        return results;
    }

    private String getIPv4AddressForInterface(String ifaceName) throws Exception {
        NetworkInterface netIf = NetworkInterface.getByName(ifaceName);
        if (netIf == null) return null;

        Enumeration<InetAddress> addresses = netIf.getInetAddresses();
        while (addresses.hasMoreElements()) {
            InetAddress addr = addresses.nextElement();
            if (!addr.isLoopbackAddress() && addr instanceof java.net.Inet4Address) {
                return addr.getHostAddress();
            }
        }
        return null;
    }
}

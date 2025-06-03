package com.example.backend;

import org.springframework.web.bind.annotation.*;
import java.io.*;
import java.util.*;

@RestController
@CrossOrigin(origins = "*")
public class NetworkController {

    @GetMapping("/get-interface")
    public Map<String, String> getInterface() {
        Map<String, String> result = new HashMap<>();
        try {
            ProcessBuilder pb = new ProcessBuilder("ifconfig");
            Process process = pb.start();

            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream()));
            String line;
            StringBuilder allOutput = new StringBuilder();
            while ((line = reader.readLine()) != null) {
                allOutput.append(line).append("\n");
            }

            result.put("output", allOutput.toString());
        } catch (IOException e) {
            result.put("error", e.getMessage());
        }
        return result;
    }
}

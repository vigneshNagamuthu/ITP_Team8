package com.example.demo;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
public class SystemInfoController {

    @GetMapping("/sysinfo")
    public String getSystemInfo() {
        StringBuilder result = new StringBuilder();

        // Run ifconfig
        try {
            Process ifconfigProc = Runtime.getRuntime().exec("ifconfig");
            BufferedReader ifconfigReader = new BufferedReader(new InputStreamReader(ifconfigProc.getInputStream()));
            String ifconfigOutput = ifconfigReader.lines().collect(Collectors.joining("\n"));
            ifconfigProc.waitFor();

            if (ifconfigOutput.isEmpty()) {
                result.append("ifconfig did not return any output.\n");
            } else {
                result.append("ifconfig output:\n").append(ifconfigOutput);
            }
        } catch (Exception e) {
            result.append("Error running ifconfig: ").append(e.getMessage())
                  .append("\nMake sure net-tools (ifconfig) is installed and accessible.");
        }

        return result.toString();
    }
}

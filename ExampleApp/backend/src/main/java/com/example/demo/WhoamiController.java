package com.example.demo;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.BufferedReader;
import java.io.InputStreamReader;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
public class WhoamiController {

    @GetMapping("/whoami")
    public String whoami() {
        try {
            Process p = Runtime.getRuntime().exec("whoami");
            BufferedReader reader = new BufferedReader(new InputStreamReader(p.getInputStream()));
            return reader.readLine();
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }
}

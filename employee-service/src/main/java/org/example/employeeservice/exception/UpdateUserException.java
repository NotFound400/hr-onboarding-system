package org.example.employeeservice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.BAD_REQUEST)
public class UpdateUserException extends RuntimeException{
    public UpdateUserException(String message) {
        super(message);
    }
}

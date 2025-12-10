package org.example.applicationservice.aop;

import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
@Aspect
public class ServiceExceptionAspect {
    private static final Logger logger = LoggerFactory.getLogger(ServiceExceptionAspect.class);

    @Pointcut("execution(* org.example.applicationservice.service..*(..))")
    public void serviceMethods() {}

    @AfterThrowing(pointcut = "serviceMethods()", throwing = "ex")
    public void logServiceException(Exception ex) {
        logger.error("Exception caught in service: {}", ex.getMessage());
    }
}

package com.fmi.exclusiveCars.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NewsDto {

    @NotBlank(message = "The title must not be blank!")
    @Size(min = 3, max = 100, message = "The title should have between 3 and 100 characters!")
    private String title;

    @NotBlank(message = "The content must not be blank!")
    @Size(min = 10, max = 10000, message = "The content should have between 10 and 10000 characters!")
    private String content;
}

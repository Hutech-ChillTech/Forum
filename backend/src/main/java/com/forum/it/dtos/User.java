package com.forum.it.dtos;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class User {

    private long userId;
    private String userName;

}

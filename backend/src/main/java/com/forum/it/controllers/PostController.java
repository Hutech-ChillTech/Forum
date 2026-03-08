package com.forum.it.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.*;

import com.forum.it.services.PostService;
import com.forum.it.contants.Routes;
import com.forum.it.dtos.response.ApiResponses;
import com.forum.it.dtos.response.PostResponse;
import com.forum.it.dtos.request.PostRequest;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;

@Data
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@RestController
@RequestMapping(Routes.Post.BASE)
public class PostController {
    PostService postService;

    @GetMapping(Routes.Post.GET_ALL)
    public ApiResponses<List<PostResponse>> getAllPost() {
        return ApiResponses.success(postService.getAllPost(), null);
    }

    @GetMapping(Routes.Post.GET_BY_ID)
    public ApiResponses<PostResponse> getPostById(UUID postId) {
        return ApiResponses.success(postService.getPostById(postId), null);
    }

    @PostMapping(Routes.Post.CREATE)
    public ApiResponses<PostResponse> createPost(PostRequest.CreatePostRequest createPostRequest, UUID userId) {
        return ApiResponses.success(postService.create(createPostRequest, userId), null);
    }

    @PutMapping(Routes.Post.UPDATE)
    public ApiResponses<PostResponse> updatePost(PostRequest.UpdatePostRequest updatePostRequest, UUID postId) {
        return ApiResponses.success(postService.update(updatePostRequest, postId), null);
    }

    @DeleteMapping(Routes.Post.DELETE)
    public ApiResponses<PostResponse> deletePost(UUID postId) {
        postService.delete(postId);
        return ApiResponses.success(null, null);
    }
}

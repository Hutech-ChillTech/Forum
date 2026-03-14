package com.forum.it.controllers;

import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import com.forum.it.services.PostService;
import com.forum.it.contants.Routes;
import com.forum.it.dtos.response.ApiResponses;
import com.forum.it.dtos.response.PostResponse;
import com.forum.it.dtos.request.PostRequest;
import com.forum.it.exceptions.AppException;
import com.forum.it.exceptions.ErrorCode;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;

@Data
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RestController
@RequestMapping(Routes.Post.BASE)
public class PostController {

    @Autowired
    final PostService postService;

    @GetMapping(Routes.Post.GET_ALL)
    public ApiResponses<List<PostResponse>> getAllPost() {
        return ApiResponses.success(postService.getAllPost(), null);
    }

    @GetMapping(Routes.Post.GET_BY_ID)
    public ApiResponses<PostResponse> getPostById(@PathVariable("postId") UUID postId) {
        return ApiResponses.success(postService.getPostById(postId), null);
    }

    @PostMapping(Routes.Post.CREATE)
    public ApiResponses<PostResponse> createPost(@RequestBody PostRequest.CreatePostRequest createPostRequest) {
        if (createPostRequest.getUserId() == null) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        UUID userId = UUID.fromString(createPostRequest.getUserId());
        System.out.println(userId);
        return ApiResponses.success(postService.create(createPostRequest, userId), null);

    }

    // @PutMapping(Routes.Post.UPDATE)
    // public ApiResponses<PostResponse> updatePost(@RequestBody
    // PostRequest.UpdatePostRequest updatePostRequest) {
    // return ApiResponses.success(postService.update(updatePostRequest, postId),
    // null);
    // }

    @DeleteMapping(Routes.Post.DELETE)
    public ApiResponses<PostResponse> deletePost(@PathVariable("postId") UUID postId) {
        postService.delete(postId);
        return ApiResponses.success(null, null);
    }
}

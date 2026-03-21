package com.forum.it.services;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.forum.it.dtos.response.PostResponse;
import com.forum.it.dtos.response.SearchResponse;
import com.forum.it.dtos.response.TagResponse;
import com.forum.it.dtos.response.UserResponse;
import com.forum.it.entities.system.SearchHistory;
import com.forum.it.entities.user.User;
import com.forum.it.repositories.PostRepository;
import com.forum.it.repositories.SearchHistoryRepository;
import com.forum.it.repositories.TagRepository;
import com.forum.it.repositories.UserRepository;
import com.forum.it.sercurites.UserPrincipal;
import com.forum.it.utils.SecurityContextHelper;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SearchService {

    UserRepository userRepository;
    TagRepository tagRepository;
    PostRepository postRepository;
    SearchHistoryRepository searchHistoryRepository;
    SecurityContextHelper securityContextHelper;

    @Transactional
    public SearchResponse globalSearch(String keyword) {
        String searchKeyword = keyword;
        if (keyword.startsWith("@")) {
            searchKeyword = keyword.substring(1);
        }

        // 1. Search Users
        List<UserResponse> users = userRepository.searchUsers(searchKeyword).stream()
                .limit(5)
                .map(UserResponse::new)
                .collect(Collectors.toList());

        // 2. Search Tags
        List<TagResponse> tags = tagRepository.searchTags(searchKeyword).stream()
                .limit(10)
                .map(TagResponse::new)
                .collect(Collectors.toList());

        // 3. Search Posts
        List<PostResponse> posts = postRepository.searchPosts(searchKeyword, PageRequest.of(0, 10))
                .getContent().stream()
                .map(PostResponse::new)
                .collect(Collectors.toList());

        // 4. Save history if logged in
        try {
            UserPrincipal principal = securityContextHelper.getCurrentUser();
            if (principal != null) {
                saveSearchHistory(principal.getUserId(), keyword);
            }
        } catch (Exception e) {
            // Not authenticated, skip history
        }

        return SearchResponse.builder()
                .users(users)
                .tags(tags)
                .posts(posts)
                .build();
    }

    @Transactional
    public void saveSearchHistory(UUID userId, String keyword) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null || keyword == null || keyword.trim().isEmpty()) {
            return;
        }

        SearchHistory history = searchHistoryRepository.findByUserAndKeyword(user, keyword.trim())
                .orElse(SearchHistory.builder()
                        .user(user)
                        .keyword(keyword.trim())
                        .build());

        // Update searchedAt (Hibernate @CreationTimestamp might only work on insert,
        // but we can manually update it if it's already existing)
        // Since it's @CreationTimestamp, it might be better to just delete and
        // re-insert or use @UpdateTimestamp
        // Let's just update the timestamp manually if we want it to be "most recent"
        history.setSearchedAt(java.time.LocalDateTime.now());
        searchHistoryRepository.save(history);
    }

    public List<String> getSearchHistory() {
        UserPrincipal principal = securityContextHelper.getCurrentUser();
        User user = userRepository.findById(principal.getUserId()).orElseThrow();

        return searchHistoryRepository.findByUserOrderBySearchedAtDesc(user, PageRequest.of(0, 10))
                .stream()
                .map(SearchHistory::getKeyword)
                .collect(Collectors.toList());
    }

    @Transactional
    public void clearHistory() {
        UserPrincipal principal = securityContextHelper.getCurrentUser();
        User user = userRepository.findById(principal.getUserId()).orElseThrow();
        searchHistoryRepository.deleteByUser(user);
    }

    @Transactional
    public void removeHistoryItem(String keyword) {
        UserPrincipal principal = securityContextHelper.getCurrentUser();
        User user = userRepository.findById(principal.getUserId()).orElseThrow();
        searchHistoryRepository.deleteByUserAndKeyword(user, keyword.trim());
    }
}

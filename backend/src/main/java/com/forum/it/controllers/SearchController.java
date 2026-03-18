package com.forum.it.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.forum.it.contants.Routes;
import com.forum.it.dtos.response.ApiResponses;
import com.forum.it.dtos.response.SearchResponse;
import com.forum.it.services.SearchService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping(Routes.Search.BASE)
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    public ApiResponses<SearchResponse> globalSearch(@RequestParam String keyword) {
        return ApiResponses.success(searchService.globalSearch(keyword), null);
    }

    @GetMapping(Routes.Search.HISTORY)
    public ApiResponses<List<String>> getSearchHistory() {
        return ApiResponses.success(searchService.getSearchHistory(), null);
    }

    @DeleteMapping(Routes.Search.CLEAR_HISTORY)
    public ApiResponses<String> clearHistory() {
        searchService.clearHistory();
        return ApiResponses.success("Search history cleared", null);
    }

    @DeleteMapping(Routes.Search.REMOVE_HISTORY_ITEM)
    public ApiResponses<String> removeHistoryItem(@RequestParam String keyword) {
        searchService.removeHistoryItem(keyword);
        return ApiResponses.success("Search history item removed", null);
    }
}

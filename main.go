package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"sync"
	"time"

	"github.com/shurcooL/githubv4"
	"golang.org/x/oauth2"
	"golang.org/x/time/rate"
)

type ProjectManager struct {
	client  *githubv4.Client
	project string
	repos   []string

	pageLimit int
}

type PageInfo struct {
	HasNextPage githubv4.Boolean
	EndCursor   *githubv4.String
}

type Issue struct {
	ID         githubv4.ID
	Number     githubv4.Int
	Title      githubv4.String
	URL        githubv4.URI
	Repository struct {
		Name githubv4.String
	}
}

type OpenIssuesNotInProjectQuery struct {
	client    *githubv4.Client
	project   string
	repos     []string
	pageLimit int

	pageInfo *PageInfo
	err      error

	g struct {
		Search struct {
			IssueCount int
			Nodes      []struct {
				Issue Issue `graphql:"... on Issue"`
			}
			PageInfo PageInfo
		} `graphql:"search(query:$query,type:$type,first:$first,after:$after)"`
	}
}

func (q *OpenIssuesNotInProjectQuery) Do() bool {
	if q.err != nil || q.pageInfo != nil && !q.pageInfo.HasNextPage {
		return false
	}

	// TODO: validate input (project, repos) before doing unsafe string interpolation.
	searchQuery := fmt.Sprintf("is:issue is:open -project:%s", q.project)
	for _, repo := range q.repos {
		searchQuery += fmt.Sprintf(" repo:%s", repo)
	}
	searchQuery += " sort:created-asc"
	q.err = q.client.Query(context.Background(), &q.g, map[string]interface{}{
		"query": githubv4.String(searchQuery),
		"type":  githubv4.SearchTypeIssue,
		"first": githubv4.Int(q.pageLimit),
		"after": q.g.Search.PageInfo.EndCursor,
	})
	if q.err != nil {
		return false
	}
	q.pageInfo = &q.g.Search.PageInfo
	return q.g.Search.IssueCount > 0
}

// DoShared and Do are mutually exclusive.
func (q *OpenIssuesNotInProjectQuery) DoShared() bool {
	if q.err != nil || q.pageInfo != nil && !q.pageInfo.HasNextPage {
		return false
	}

	// TODO: validate input (project, repos) before doing unsafe string interpolation.
	searchQuery := fmt.Sprintf(`is:issue is:open org:getsentry label:"Team: Web Platform" -project:%s`, q.project)
	searchQuery += " sort:created-asc"
	q.err = q.client.Query(context.Background(), &q.g, map[string]interface{}{
		"query": githubv4.String(searchQuery),
		"type":  githubv4.SearchTypeIssue,
		"first": githubv4.Int(q.pageLimit),
		"after": q.g.Search.PageInfo.EndCursor,
	})
	if q.err != nil {
		return false
	}
	q.pageInfo = &q.g.Search.PageInfo
	return q.g.Search.IssueCount > 0
}

func (q *OpenIssuesNotInProjectQuery) Issues() []Issue {
	var s []Issue
	for _, node := range q.g.Search.Nodes {
		s = append(s, node.Issue)
	}
	return s
}

func (q *OpenIssuesNotInProjectQuery) Err() error {
	return q.err
}

func (pm *ProjectManager) NewOpenIssuesNotInProjectQuery() *OpenIssuesNotInProjectQuery {
	return &OpenIssuesNotInProjectQuery{
		client:    pm.client,
		project:   pm.project,
		repos:     pm.repos,
		pageLimit: pm.pageLimit,
	}
}

func (pm *ProjectManager) AddContentToProjectColumn(contentID githubv4.ID, projectColumnID githubv4.ID) (githubv4.URI, error) {
	var m struct {
		AddProjectCard struct {
			CardEdge struct {
				Node struct {
					URL githubv4.URI
				}
			}
		} `graphql:"addProjectCard(input:$input)"`
	}
	input := githubv4.AddProjectCardInput{
		ProjectColumnID: projectColumnID,
		ContentID:       githubv4.NewID(contentID),
	}

	err := pm.client.Mutate(context.Background(), &m, input, nil)
	return m.AddProjectCard.CardEdge.Node.URL, err
}

func main() {
	if os.Getenv("GITHUB_ACTIONS") != "true" {
		log.Print("WARNING: command is not running in GitHub Actions")
	}
	token := os.Getenv("GITHUB_TOKEN")
	if token == "" {
		log.Fatal("missing required GITHUB_TOKEN")
	}

	src := oauth2.StaticTokenSource(&oauth2.Token{AccessToken: token})
	httpClient := oauth2.NewClient(context.Background(), src)
	client := githubv4.NewClient(httpClient)

	pm := ProjectManager{
		client:  client,
		project: "getsentry/10", // Web Platform Team board
		repos: []string{
			"getsentry/sentry-javascript",
			"getsentry/sentry-python",
			"getsentry/sentry-go",
			"getsentry/sentry-webpack-plugin",
			"getsentry/sentry-cli",
			"getsentry/sentry-wizard",
			"getsentry/sentry-php",
			// "getsentry/sentry-php-sdk", // sentry-php-sdk has Pull Requests only
			"getsentry/sentry-laravel",
			"getsentry/sentry-symfony",
			"getsentry/sentry-ruby",
			"getsentry/sentry-elixir",
		},
		pageLimit: 100,
	}

	// TODO: get this value using a query
	projectColumnID := "PC_lAPOABVQ184AtyQWzgDNOZg"

	ch := make(chan Issue, 1)
	var wg sync.WaitGroup
	wg.Add(2)
	go func() {
		defer wg.Done()
		q := pm.NewOpenIssuesNotInProjectQuery()
		var once sync.Once
		for q.Do() {
			once.Do(func() {
				log.Printf("Own Projects: Found %d open issues that do not belong to project %s", q.g.Search.IssueCount, q.project)
			})
			issues := q.Issues()
			log.Printf("Own Projects: Queueing %d issues", len(issues))
			for _, issue := range issues {
				ch <- issue
			}
		}
		if err := q.Err(); err != nil {
			panic(err)
		}
	}()
	go func() {
		// for "getsentry/sentry" and "getsentry/sentry-docs"
		defer wg.Done()
		q := pm.NewOpenIssuesNotInProjectQuery()
		var once sync.Once
		for q.DoShared() {
			once.Do(func() {
				log.Printf("Shared Projects: Found %d open issues that do not belong to project %s", q.g.Search.IssueCount, q.project)
			})
			issues := q.Issues()
			log.Printf("Own Projects: Queueing %d issues", len(issues))
			for _, issue := range issues {
				ch <- issue
			}
		}
		if err := q.Err(); err != nil {
			panic(err)
		}
	}()
	go func() {
		wg.Wait()
		close(ch)
	}()

	lmt := rate.NewLimiter(rate.Every(time.Second), 2)

	for issue := range ch {
		_ = lmt.Wait(context.Background())
		log.Printf("Processing %s", issue.URL)
		url, err := pm.AddContentToProjectColumn(issue.ID, projectColumnID)
		if err != nil {
			panic(err)
		}
		log.Printf("Added project card: %s", url)
	}
}

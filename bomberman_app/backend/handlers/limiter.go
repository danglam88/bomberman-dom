package handlers

import (
	"log"
	"net/http"
	"time"
)

// The Rate limiter now it is set to 100 requests per second
var limiter = NewLimiter(100, 1*time.Second)

// Limit is a middleware that limits the number of requests per second
func Limit(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !limiter.Allow() {
			http.Error(w, http.StatusText(http.StatusTooManyRequests), http.StatusTooManyRequests)
			return
		}
		// If the limit has not been reached, then continue to server our regular handler
		next.ServeHTTP(w, r)
	})
}

// Sets the limit and interval
func NewLimiter(limit int, interval time.Duration) *Limiter {
	return &Limiter{
		limit:    limit,
		interval: interval,
		reset:    time.Now().Add(interval),
	}
}

// Checks if the limit has been reached
func (l *Limiter) Allow() bool {
	now := time.Now()
	if now.After(l.reset) {
		l.events = 1
		l.reset = now.Add(l.interval)
		return true
	}
	l.events++
	if l.events > l.limit {
		log.Println("Server -> Rate limit exceeded")
		return false
	}
	return true
}

// Limiter struct
type Limiter struct {
	limit    int           // maximum number of events
	interval time.Duration // duration of the interval
	events   int           // number of events in the current interval
	reset    time.Time     // time when the interval resets
}

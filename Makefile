MOCHA_OPTS=
REPORTER = dot

check: test

test: test-unit test-acceptance

test-unit:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		$(MOCHA_OPTS)

test-acceptance:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--bail \
		test/acceptance/*.js

test-cov: lib-cov
	@EXPRESS_COV=1 $(MAKE) test REPORTER=html-cov > coverage.html

lib-cov:
	@jscoverage lib lib-cov

benchmark:
	@./support/bench

test-check:
	@SERVER_HOST=jszx100.com ./node_modules/.bin/mocha \
		--reporter spec \
		test/check/*.js \
		2>&1 \
		|tee check_report.txt
	
clean:
	rm -f coverage.html
	rm -fr lib-cov
	rm -f check_report.txt

.PHONY: test test-unit test-acceptance benchmark test-check clean
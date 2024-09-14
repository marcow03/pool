FROM golang:1.22.0 as builder

WORKDIR /src
COPY . /src/
RUN CGO_ENABLED=0 GOOS=linux go build -a -o /bin/pool .

FROM alpine:latest

COPY --from=builder /bin/pool /bin/pool
EXPOSE 8080
CMD [ "/bin/pool", "-path", "/data" ]
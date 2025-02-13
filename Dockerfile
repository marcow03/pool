FROM golang:1.22.0 AS builder

WORKDIR /src
COPY . /src/
RUN CGO_ENABLED=0 GOOS=linux go build -a -o /bin/pool .

FROM alpine

COPY --from=builder /bin/pool /bin/pool
EXPOSE 8080
CMD [ "/bin/pool", "-path", "/data" ]

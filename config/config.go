package config

type Config struct {
	PoolDir string `env:"POOL_DIR,default=./pool"`
}

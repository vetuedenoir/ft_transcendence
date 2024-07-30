HOSTNAME=$(shell hostname)
DOCKER_COMPOSE=docker compose


ifneq (, $(findstring m2mac, $(HOSTNAME)))
	DOCKER_COMPOSE=docker-compose
endif

all: run

rm_vol: down

vol: down rm_vol build_volume

run:
	$(DOCKER_COMPOSE) -f srcs/docker-compose.yaml up --build  -d

down: 
	$(DOCKER_COMPOSE) -f srcs/docker-compose.yaml down --volumes

clean: down rm_vol
	docker network rm backend || true
	docker volume prune -f
	docker system prune -a -f

fclean: down
	docker stop $(docker ps -aq) && docker rm $(docker ps -aq) && docker rmi $(docker images -q) && docker image prune -f && docker volume prune -f && docker network prune -f

ffclean:
	@if [ ! -z "$$(docker ps -q)" ]; then \
		docker stop $$(docker ps -q); \
		docker rm $$(docker ps -aq); \
	fi
	@docker system prune -af
	@docker volume prune -f
	@docker network prune -f

front: # to restart the frontend service only
	@docker-compose -f srcs/docker-compose.yaml build frontend-service && docker-compose -f srcs/docker-compose.yaml up -d frontend-service


restart: down rm_vol run

re: clean run


status:
	@echo "============ CONTAINERS ============" && docker ps -a && echo "============ IMAGES ============" && docker images -a && echo "============ VOLUMES ============" && docker volume ls && echo "============ NETWORKS ============" && docker network ls && echo "============"

 
.PHONY: all rm_vol vol run down clean fclean ffclean restart re status front
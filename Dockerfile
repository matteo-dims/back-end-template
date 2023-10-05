# Use an official MongoDB image as the base image
FROM mongo:latest

# Set environment variables (optional)
ENV MONGO_INITDB_ROOT_USERNAME=root
ENV MONGO_INITDB_ROOT_PASSWORD=root

# Create a directory to store MongoDB data (optional)
RUN mkdir -p /data/db

# Expose MongoDB port
EXPOSE 27017

# Start MongoDB when the container runs
CMD ["mongod"]
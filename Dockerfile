# Use the official Node.js image as a parent image
FROM node:18 

# Set the working directory within the docker image
WORKDIR /usr/src/app 

# Copy the current directory contents into the container at /usr/src/app
COPY . . 

# Install any needed packages for C++ build
RUN apt-get update && apt-get install -y \
build-essential 

# Build the C++ application
RUN cd llama.cpp && make 

# Install Node.js dependencies
RUN npm install 

# Make port 80 available to the world outside this container
EXPOSE 80 

# Run server.js when the container launches
CMD ["node", "server.js"] 

FROM node
EXPOSE 9001
COPY ./src/ /
RUN ls -laR src/
RUN npm install 
CMD ["npm",  "start"]

pkgs <- c("dplyr", "ggplot2")
pkgs_installed <- lapply(pkgs, require, character.only = TRUE)
if(length(pkgs[!unlist(pkgs_installed)])){
  install.packages(pkgs[!unlist(pkgs_installed)])
  lapply(pkgs[!unlist(pkgs_installed)], require, character.only = TRUE)
}
rm(pkgs, pkgs_installed)

vornamen <- read.csv("bev_vornamen_baby_seit1993.csv", stringsAsFactors = FALSE)

vornamen2 <- vornamen
vornamen2$geschlecht <- "gesamt"

vornamen <- rbind(vornamen,vornamen2)

vornamen$length <- nchar(vornamen$vorname)

v <- aggregate(Anzahl ~ jahr + geschlecht, data = vornamen, sum)

#v2 <- aggregate(Anzahl ~ jahr, data = vornamen, sum)

#v2$geschlecht <- "gesamt"

#v <- rbind(v,v2)

v$total <- v$Anzahl
v$Anzahl <- NULL


letters = "aeiou"
letters = "abcdefghijklmnopqrstuvwxyz"

for (i in 1:nchar(letters)) {
  letter <- substring(letters,i,i)
  vornamen[,letter] <- grepl(letter,vornamen$vorname, ignore.case = TRUE)
  vornamen[,paste0(letter,2)] <- letter == tolower(substring(vornamen$vorname,1,1))
}

v3 <- data.frame(jahr = integer(), geschlecht = character(), letter = character(), Anzahl = integer())
v5 <- data.frame(jahr = integer(), geschlecht = character(), letter = character(), AnzahlStart = integer())

for (i in 1:nchar(letters)) {
  letter <- substring(letters,i,i)
  v4 <- aggregate(Anzahl ~ jahr + geschlecht, data = vornamen[vornamen[,letter],], sum)
  v4$letter <- letter
  v3 <- rbind(v3,v4)
  
  if(dim(vornamen[vornamen[,paste0(letter,2)],])[1]>0){
    v6 <- aggregate(Anzahl ~ jahr + geschlecht, data = vornamen[vornamen[,paste0(letter,2)],], sum)
    v6$letter <- letter
  
    v6$AnzahlStart <- v6$Anzahl
    v6$Anzahl <- NULL
  
    v5 <- rbind(v5,v6)
  }
}
v3 <- merge(v, v3, by = c("geschlecht","jahr"))
v3 <- merge(v3, v5, by = c("geschlecht","jahr", "letter"), all.x = TRUE)
v3[is.na(v3$AnzahlStart),"AnzahlStart"] <- 0

v3$Anteil <- v3$Anzahl / v3$total
v3$AnteilStart <- v3$AnzahlStart / v3$total

ggplot(v3[v3$geschlecht == "gesamt",], aes(x=jahr, y=AnteilStart, color=factor(letter))) + geom_line()

v3$total <- v3$Anzahl <- v3$AnzahlStart <- NULL

v3$Anteil <- round(v3$Anteil*100,1)
v3$AnteilStart <- round(v3$AnteilStart*100,1)

v3[v3$geschlecht == "weiblich", "geschlecht"] <- "f"
v3[v3$geschlecht == "männlich", "geschlecht"] <- "m"
v3[v3$geschlecht == "gesamt", "geschlecht"] <- "t"

write.csv(v3, "vornamen.csv", row.names = FALSE)



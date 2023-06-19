package handlers

import (
	"encoding/json"
	"math/rand"
	"net/http"
	"time"
)

const (
	mapWidth  = 900
	mapHeight = 900
	tileSize  = 45

	player1StartTop  = 10
	player1StartLeft = 5
	player2StartTop  = mapHeight - 55
	player2StartLeft = mapWidth - 50
	player3StartTop  = 10
	player3StartLeft = mapWidth - 50
	player4StartTop  = mapHeight - 55
	player4StartLeft = 5

	multipleBombsGift = 2 //8
	bombRangeGift     = 2 //9
	speedGift         = 2 //10
	lifeGift          = 2 //11
	bricksNo          = 100
)

type Level struct {
	Data [][]int `json:"data"`
}

type Spot struct {
	Class string
	Top   int
	Left  int
	Z     int
	Image string
}

func NewGame(w http.ResponseWriter, r *http.Request) {
	gameMap := createNewGame()
	addedFeatures := gameIntoJSON(gameMap)
	jsonData, err := json.Marshal(addedFeatures)
	if err != nil {
		GetErrResponse(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(jsonData)
}

func createNewGame() Level {
	orginalMap := Level{
		Data: [][]int{
			{3, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 6},
			{0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0},
			{2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2},
			{0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0},
			{0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0},
			{2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2},
			{0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0},
			{0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0},
			{2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2},
			{0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0},
			{0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0},
			{2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2},
			{0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0},
			{0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0},
			{2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2},
			{0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0},
			{0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0},
			{2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 2, 2},
			{0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0},
			{7, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 5},
		},
	}

	copyLevel := Level{
		Data: make([][]int, len(orginalMap.Data)),
	}

	for i := range orginalMap.Data {
		copyLevel.Data[i] = make([]int, len(orginalMap.Data[i]))
		copy(copyLevel.Data[i], orginalMap.Data[i])
	}

	brickCoords := [][]int{}
	for i := 0; i < len(copyLevel.Data); i++ {
		for j := 0; j < len(copyLevel.Data[i]); j++ {
			if copyLevel.Data[i][j] == 2 {
				brickCoords = append(brickCoords, []int{i, j})
			}
		}
	}

	rand.Seed(time.Now().UnixNano())

	for i := len(brickCoords) - 1; i > 0; i-- {
		j := rand.Intn(i + 1)
		brickCoords[i], brickCoords[j] = brickCoords[j], brickCoords[i]
	}

	brickAddedCoords := [][]int{}

	for i := 0; i < bricksNo; i++ {
		coordinate := brickCoords[i]
		copyLevel.Data[coordinate[0]][coordinate[1]] = 4
		brickAddedCoords = append(brickAddedCoords, coordinate)
	}

	gifts := []int{}
	for i := 0; i < multipleBombsGift; i++ {
		gifts = append(gifts, 8)
	}
	for i := 0; i < bombRangeGift; i++ {
		gifts = append(gifts, 9)
	}
	for i := 0; i < speedGift; i++ {
		gifts = append(gifts, 10)
	}
	for i := 0; i < lifeGift; i++ {
		gifts = append(gifts, 11)
	}

	for i := len(brickAddedCoords) - 1; i > 0; i-- {
		j := rand.Intn(i + 1)
		brickAddedCoords[i], brickAddedCoords[j] = brickAddedCoords[j], brickAddedCoords[i]
	}

	for i := 0; i < len(gifts); i++ {
		coordinate := brickAddedCoords[i]
		copyLevel.Data[coordinate[0]][coordinate[1]] = gifts[i]
	}
	return copyLevel
}

func gameIntoJSON(gameMap Level) []Spot {
	filledMap := []Spot{}
	for i := 0; i < len(gameMap.Data); i++ {
		for j := 0; j < len(gameMap.Data[i]); j++ {
			if gameMap.Data[i][j] == 1 {
				thisSpot := Spot{
					Class: "wall",
					Top:   i * 45,
					Left:  j * 45,
					Z:     1,
					Image: "url('img/wall.png')",
				}
				filledMap = append(filledMap, thisSpot)
			} else if gameMap.Data[i][j] == 3 {
				thisSpot := Spot{
					Class: "player moving",
					Top:   i*45 + 10, //10
					Left:  j*45 + 5,  //5
					Z:     2,
					Image: "url('img/blue-front0.png')",
				}
				filledMap = append(filledMap, thisSpot)
			} else if gameMap.Data[i][j] == 5 {
				thisSpot := Spot{
					Class: "player moving",
					Top:   i*45 - 10, //845
					Left:  j*45 - 5,  //850
					Z:     2,
					Image: "url('img/purple-front0.png')",
				}
				filledMap = append(filledMap, thisSpot)
			} else if gameMap.Data[i][j] == 6 {
				thisSpot := Spot{
					Class: "player moving",
					Top:   i*45 + 10, //10
					Left:  j*45 - 5,  //850
					Z:     2,
					Image: "url('img/dark-front0.png')",
				}
				filledMap = append(filledMap, thisSpot)
			} else if gameMap.Data[i][j] == 7 {
				thisSpot := Spot{
					Class: "player moving",
					Top:   i*45 - 10, //845
					Left:  j*45 + 5,  //5
					Z:     2,
					Image: "url('img/red-front0.png')",
				}
				filledMap = append(filledMap, thisSpot)
			} else if gameMap.Data[i][j] == 4 {
				thisSpot := Spot{
					Class: "brick",
					Top:   i * 45,
					Left:  j * 45,
					Z:     1,
					Image: "url('img/brick.png')",
				}
				filledMap = append(filledMap, thisSpot)
			} else if gameMap.Data[i][j] == 8 {
				thisSpot := Spot{
					Class: "brick multiple-bombs-gift",
					Top:   i * 45,
					Left:  j * 45,
					Z:     1,
					Image: "url('img/brick.png')",
				}
				filledMap = append(filledMap, thisSpot)
			} else if gameMap.Data[i][j] == 9 {
				thisSpot := Spot{
					Class: "brick bomb-range-gift",
					Top:   i * 45,
					Left:  j * 45,
					Z:     1,
					Image: "url('img/brick.png')",
				}
				filledMap = append(filledMap, thisSpot)
			} else if gameMap.Data[i][j] == 10 {
				thisSpot := Spot{
					Class: "brick speed-gift",
					Top:   i * 45,
					Left:  j * 45,
					Z:     1,
					Image: "url('img/brick.png')",
				}
				filledMap = append(filledMap, thisSpot)
			} else if gameMap.Data[i][j] == 11 {
				thisSpot := Spot{
					Class: "brick life-gift",
					Top:   i * 45,
					Left:  j * 45,
					Z:     1,
					Image: "url('img/brick.png')",
				}
				filledMap = append(filledMap, thisSpot)
			}
		}
	}
	return filledMap
}
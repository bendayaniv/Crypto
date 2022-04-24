/// <reference path="jquery-3.4.1.js"/>


(function () {
    $(() => {


        let urlCoins = "https://api.coingecko.com/api/v3/coins/";
        let coinsArray = [];
        let toggleSwitchArray = [];
        let moreInfoTimeArray = [];



        let dataPoints;
        let xValue = 0;
        let chartUrl = "";
        let myTimeOut; 



        $("#loader").css("display", "block");
        $("#aboutMeDiv").hide();
        $("footer").hide();
        $("#chartContainer").hide();

        showCoinsData();



        /*=========================================================================*/


        //Getting Coins Data:
        function getCoinsData(url) {
            return new Promise((resolve, reject) => {
                $.getJSON(url, coins => {
                    resolve(coins);
                }).fail(err => {
                    reject(err);
                });
            });
        }


        /*=========================================================================*/


        //Showing `All` (100) Coins Data:
        function showCoinsData() {
            getCoinsData(urlCoins + "list")
                .then(coins => {
                    coinsArray = coins.slice(0, 100);
                    createManyCards(coinsArray);
                    loadChekedToggleSwitch();
                }).catch(err => {
                    alert(err);
                });
        }


        /*=========================================================================*/


        //Search Button:
        $("#searchButton").click(() => {
            $("main").empty();
            $("#loader").css("display", "block");
            showSpecificCoinsData();
        });


        //Searching Specific coins card by their "symbol":
        function showSpecificCoinsData() {
            let searchValue = $("#searchInput").val();
            if (searchValue === "") {
                alert("Please enter coin nickname");
                showCoinsData(coinsArray);
                return;
            }
            for (let coin of coinsArray) {
                if (searchValue === coin.symbol) {
                    createOneCard(coin);
                    return;
                }
            }
            alert("This coin is not available here. Please enter right coin nickname");
            $("#searchInput").val("");
            showCoinsData();
        }




        /*=========================================================================*/




        //Create many cards:
        function createManyCards(coinsArray) {
            for (let coin of coinsArray) {
                createOneCard(coin);
            }
        }


        //Create one card:
        function createOneCard(coin) {
            const toggleSwitch = `<label class="switch">
                                    <input type="checkbox" class="toggleSwitch" id="toggleSwitch${coin.id}" data-toggle="modal" data-target="#exampleModalCenter">
                                    <span class="slider round"></span>
                                 </label>`;
            const symbol = `<h5 class="card-title">${coin.symbol}</h5>`;
            const name = `<p class="card-text">${coin.name}</p>`;
            const moreInfo = `<p class="moreInfoButtonParagraph">
                                <button class="btn btn-primary moreInfoButton" id="moreInfoButton${coin.id}" type="button" data-toggle="collapse" data-target="#collapseExample${coin.id}" aria-expanded="false" aria-controls="collapseExample">
                                More Info</button>
                              </p>
                              <div class="collapse" id="collapseExample${coin.id}">
                                <div class="card card-body moreInfoDivDetails" id="moreInfoDivDetails${coin.id}"><img class="moreInfoLoader" id="loader${coin.id}" src="assets/images/loading2.gif"></div>
                              </div>`;
            const cardBody = `<div class="card-body" id="${coin.id}card-body">${toggleSwitch}${symbol}${name}${moreInfo}</div>`;
            const card = `<div class="card" id="cardId${coin.id}">${cardBody}</div>`;

            $("main").append(card);

            $(`#moreInfoButton${coin.id}`).click(() => {
                let isVisible = $(`#collapseExample${coin.id}`).is(":visible");
                if (isVisible === true) {
                    return;
                }
                let currentTime = new Date();
                let limitTime = 2 * 60 * 1000;
                for (let i = 0; i < moreInfoTimeArray.length; i++) {
                    if (coin.id === moreInfoTimeArray[i].id) {
                        if (currentTime.getTime() - moreInfoTimeArray[i].time > limitTime) {

                            // Going again to bring the info:
                            getCoinsData(urlCoins + coin.id)
                                .then(coinData => {
                                    setMoreInfoData(coinData, coin.id);
                                    moreInfoTimeArray[i].time = (new Date()).getTime();
                                }).catch(err => {
                                    alert(err);
                                });
                        } else {
                            // The info is already exist:
                        }
                        return;
                    }

                }
                // Getting the info:
                getCoinsData(urlCoins + coin.id)
                    .then(coinData => {
                        setMoreInfoData(coinData, coin.id);
                        moreInfoTimeArray.push({ time: (new Date()).getTime(), id: coin.id });
                        $(`#loader${coin.id}`).css("display", "none");
                    }).catch(err => {
                        alert(err);
                    });

            })







            //Handle the clicking on toggle switch:
            $(`#toggleSwitch${coin.id}`).click(() => {
                $('#modalDiv').remove();
                let coinId = `toggleSwitch${coin.id}`;
                let coinSymbol = coin.symbol;
                let toggleState = $(`#toggleSwitch${coin.id}`).is(`:checked`);
                if (toggleState === false) {
                    savingCheckedToggleSwitch(coinId, coinSymbol, toggleState);
                }
                else if ($(`[type="checkbox"]:checked`).length > 5) {
                    createModal(coinId, coinSymbol);
                    return;
                }
                else {
                    savingCheckedToggleSwitch(coinId, coinSymbol, toggleState);
                }
            });

            $("#loader").css("display", "none");
            $("footer").show();
        }



        //Get More Info Data:
        function setMoreInfoData(coinData, coinId) {
            const coinImage = `<img class="moreInfoImage" src="${coinData.image.small}">`;
            const usdPrice = `<p class="moreInfoParagraphDetails">Price in USD: ${coinData.market_data.current_price.usd}$</p>`;
            const eurPrice = `<p class="moreInfoParagraphDetails">Price in EUR: ${coinData.market_data.current_price.eur}\u20AC</p>`;
            const ilsPrice = `<p class="moreInfoParagraphDetails">Price in ILS: ${coinData.market_data.current_price.ils}&#x20AA</p>`;

            const moreInfoDetails = `<div class="moreInfoDetails">${coinImage}${usdPrice}${eurPrice}${ilsPrice}</div>`;

            $(`#moreInfoDivDetails${coinId}`).empty();
            $(`#moreInfoDivDetails${coinId}`).append(moreInfoDetails);
        }


        //Calling Modal:
        function createModal(coinId, coinSymbol) {
            const modal = `<div id="modalDiv">
                                <div class="modal fade" id="exampleModalCenter" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                                    <div class="modal-dialog modal-dialog-centered" role="document">
                                        <div class="modal-content">
                                            <div class="modal-header">
                                                <h5 class="modal-title" id="exampleModalCenterTitle">You can choose just 5 coins!<br>
                                                Unchecked one and press "Exit".<br>Or just press "Exit".</h5>
                                            </div>
                                            <div class="modal-body">
                                                
                                            </div>
                                            <div class="modal-footer">
                                                <button type="button" class="btn btn-secondary exitButton" data-dismiss="modal">Exit</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>`;

            $("body").append(modal);
            let modalBody = $(`.modal-body`);

            for (let i = 0; i < toggleSwitchArray.length; i++) {
                const toggleSwitch = `<label class="switch">
                                    <input type="checkbox" class="toggleSwitch modalToggleSwitch" data-dismiss="modal" id="modal${toggleSwitchArray[i].id}" checked="checked">
                                    <span class="slider round"></span>
                                 </label>`;
                const symbol = `<h5 class="card-title">${toggleSwitchArray[i].symbol}</h5>`;
                const coinParagraph = `<p class="modalCoinParagraph">${symbol}${toggleSwitch}</p><br>`;
                modalBody.append(coinParagraph);

                $(`#modal${toggleSwitchArray[i].id}`).click(() => {

                    //Remove the coin from `checked` coins:
                    $(`#${toggleSwitchArray[i].id}`).prop(`checked`, false);
                    savingCheckedToggleSwitch(toggleSwitchArray[i].id, toggleSwitchArray[i].symbol, false);

                    //Adding the last coin to `checked` coins:
                    savingCheckedToggleSwitch(coinId, coinSymbol, true);

                })
            }



            //Unchecked the last `checked` coin:
            $(`.exitButton`).click(() => {
                $(`#${coinId}`).prop(`checked`, false);
            })
        }


        //Saving checked toggle switch:
        function savingCheckedToggleSwitch(chekcedToggleSwitchId, coinSymbol, checkedToggleState) {
            if (checkedToggleState) {

                let toggleData = {
                    id: chekcedToggleSwitchId,
                    symbol: coinSymbol
                }
                toggleSwitchArray.push(toggleData);
            }
            else {
                for (let i = 0; i < toggleSwitchArray.length; i++) {
                    if (chekcedToggleSwitchId === toggleSwitchArray[i].id) {
                        toggleSwitchArray.splice(i, 1);
                        break;
                    }
                }
            }
            localStorage.setItem("toggleSwitchChecked", JSON.stringify(toggleSwitchArray));
        }


        //Loading checked toggle switch:
        function loadChekedToggleSwitch() {
            let prevChekcedToggleSwitch = localStorage.getItem("toggleSwitchChecked");

            if (prevChekcedToggleSwitch) {
                toggleSwitchArray = JSON.parse(prevChekcedToggleSwitch);
            }

            for (let i = 0; i < toggleSwitchArray.length; i++) {
                $(`#${toggleSwitchArray[i].id}`).attr(`checked`, true);
            }
        }






        /*=========================================================================*/

        // Chart Functions:

        function addData(data) {
            for(let i = 0; i < toggleSwitchArray.length; i++) {
                if(data[toggleSwitchArray[i].symbol.toUpperCase()] === undefined) {
                    continue;
                }
                let yValue = data[toggleSwitchArray[i].symbol.toUpperCase()]["USD"];
                dataPoints[i].push({ x: xValue, y: yValue });
            } 
            xValue = xValue + 2;

            $("#chartContainer").CanvasJSChart().render()
            myTimeOut = setTimeout(updateData, 2000);
        }


        function updateData() {
            $.getJSON(chartUrl, addData);
        }


        function showChart() {
            
            dataPoints = [[], [], [], [], []];
            xValue = 0;
            clearTimeout(myTimeOut);

            let chartData = [];
   
            for(let i = 0; i < toggleSwitchArray.length; i++) { 
                chartData.push({type: "line", name: `${toggleSwitchArray[i].symbol}`, showInLegend: true, dataPoints: dataPoints[i]});      
            }

            let options = {
                theme: "light2",
                title: {
                    text: "Live Currency Coins Data"
                },
                subtitles: [{
                    text: "Click on the Coins Symbol to Hide or Unhide Data Series"
                }],
                axisX: {
                    title: "Time(sec)"
                },
                axisY: {
                    title: "Coin Value(USD)"
                },
                toolTip: {
                    shared: true
                },
                legend: {
                    cursor: "pointer",
                    itemclick: toggleDataSeries
                },
                data: chartData
            };

            let firstPartUrl = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=`;
            let secondPartUrl = ``;
            let thirdPartUrl = `&tsyms=USD`;
            for (let i = 0; i < toggleSwitchArray.length; i++) {
                secondPartUrl = secondPartUrl + "," + toggleSwitchArray[i].symbol.toUpperCase();
            }
            chartUrl = firstPartUrl + secondPartUrl + thirdPartUrl;

            $("#chartContainer").CanvasJSChart(options);
            updateData();

        }

        // Hide or Unhide Data Series:
        function toggleDataSeries(e) {
            if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                e.dataSeries.visible = false;
            } else {
                e.dataSeries.visible = true;
            }
            e.chart.render();
        }



        /*=========================================================================*/




        //Clicking on links:

        //"Home" link:
        $("#homeLink").click(() => {
            $("#loader").css("display", "block");
            $("#aboutMeDiv").hide();
            $("#chartContainer").hide();
            $("#searchPlace").show();
            $("main").empty();

            showCoinsData();
        });

        //"Live Report" link:
        $("#liveReportLink").click(() => {
            $("#loader").css("display", "block");

            if(toggleSwitchArray.length < 1) {
                alert("You need to choose at least one coin to show up!");
                return showCoinsData();
            }
            
            $("#aboutMeDiv").hide();
            $("#searchPlace").hide();
            $("#chartContainer").show();
            $("main").empty();

            showChart();

            $("#loader").css("display", "none");
        });

        //"About Me" link:
        $("#aboutMeLink").click(() => {
            $("#loader").css("display", "block");
            $("#aboutMeDiv").show();
            $("#chartContainer").hide();
            $("#searchPlace").hide();
            $("main").empty();
            $("#loader").css("display", "none");
        });

    });
})();
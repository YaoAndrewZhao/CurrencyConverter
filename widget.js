var currenyArray = ['CAD', 'USD', 'EUR'];

/**
 * Retrieves base currency amount and calculate converted amount
 * @param {DOM Object} element - DOM input element for user type in base currency amount
 */
function ccBaseCurrencyInput(element) {
    var newValue = element.value;
    var container = element.parentNode.parentNode.parentNode;
    //filter input value, only valid number will be accepted
    if (ccValidateNumber(container.id, newValue, 'Invalid input amount, try again!'))
        ccCalculate(container.id);
}

/**
 * Change converted currency type and calculate converted amount
 * @param {DOM Object} element - DOM select element for user choose converted currency type
 */
function ccConvertedCurrencyChanged(element){
    var container = element.parentNode.parentNode.parentNode;
    ccCalculate(container.id);
}

/**
 * Change base currency type and calculate converted amount
 * @param {DOM Object} element - DOM select element for user choose base currency type
 */
function ccBaseCurrencyChanged(element){
    var container = element.parentNode.parentNode.parentNode;
    ccCalculate(container.id);
}

/**
 * Calculate converted amount by getting values from widget elements 
 * (base_currency_amount, base_currency_type and converted_currency_type);
 * if fromRemote == true, this function will not call ccFetchRemoteData again to
 * prevent dead loop; Instead, it will show error messages.
 * @param {String} containerId - current widget container DOM id
 * @param {Boolean} fromRemote - true if this function is called from callback function after remote date retrieval
 */
function ccCalculate(containerId, fromRemote){    
    fromRemote = fromRemote === true;
    var inputBox = document.querySelectorAll('#' + containerId + ' .currency-convertor-input')[0];
    var outputBox = document.querySelectorAll('#' + containerId + ' .currency-convertor-input')[1];
    var baseCurrency = document.querySelector('#' + containerId + ' .currency-convertor-baseCurrency');
    var convertedCurrency = document.querySelector('#' + containerId + ' .currency-convertor-convertedCurrency');
    
    if (baseCurrency.value == convertedCurrency.value)
        outputBox.value = inputBox.value;
    else {
        var ccString = localStorage.getItem("ccString");
        if (ccString == null) {
            if (fromRemote == false)
                ccFetchRemoteData(baseCurrency.value, currenyArray, ccHandleRemoteData, containerId);
            else 
                ccShowErrorMessage(containerId, 'Invalid remote data, try again!');
        } else {
            ccObject = JSON.parse(ccString);
            today = ccFormatDate(new Date());
            if (ccObject.date < today || ccObject.base != baseCurrency.value) {
                if (fromRemote == false)
                    ccFetchRemoteData(baseCurrency.value, currenyArray, ccHandleRemoteData, containerId);
                else
                    ccShowErrorMessage(containerId, 'Invalid remote data, try again!');
            }
            else{
                //filter remote output, only number is accepted
                var rate = ccObject.rates[convertedCurrency.value];
                if (ccValidateNumber(containerId, rate, 'Invalid rate, try again!'))
                    outputBox.value =  Math.round ( rate * inputBox.value * 100) /100;
           }
        }
    }
}

/**
 * Callback function to react to remote data retrieval;
 * if retrieval fails, it will prompt error message;
 * if retrieval succeeds, it will save data to local storage then calculate the converted amount
 * @param {Varied} data - JSON Object contains remote data OR simply a False value
 * @param {String} containerId - current widget container DOM id
 */
function ccHandleRemoteData(data, containerId) {
    if (data === false)
    {
        ccShowErrorMessage(containerId, 'Network is down, try again!');
        return;
    } else
        ccClearErrorMessage(containerId);
    
    var ccString = JSON.stringify(data);
    localStorage.setItem("ccString", ccString);
    ccCalculate(containerId, true);
}

/**
 * Retrieve remote data based on user-defined amount & base_currency;
 * after async request, invoke callback function to handle data/error gracefully
 * @param {String} baseCurrency - user defined base currency (ie, CAD, USD, EUR)
 * @param {Array} currenyArray - this list of all required converted currency
 * @param {Function} callback - callback function to handle post-remote-request actions
 * @param {String} containerId - current widget container DOM id
 */
function ccFetchRemoteData(baseCurrency, currenyArray, callback, containerId) {
    var url = "https://api.fixer.io/latest?base=" + baseCurrency + "&symbols=" + currenyArray.join();
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4 && xhr.status == 200) {
        var data = JSON.parse(xhr.responseText);
        callback(data, containerId);
      } else if (xhr.readyState == 4)
        callback(false, containerId);
    };
    xhr.open('GET', url, true);
    xhr.send();    
}

/**
 * widget HTML (interface structure)
 */
function ccGetTemplate() {
    return '<ul class="currency-convertor-ul">' +
                '<li class="currency-convertor-full-line">Currency converter</li>' + 
                '<li class="currency-convertor-full-line">Type in amount and select currency:</li>' +
                '<li class="currency-convertor-inputbox"><input class="currency-convertor-input" type="number" name="baseAmount" placeholder="0.00" onInput="ccBaseCurrencyInput(this)"></li>'+
                '<li class="currency-convertor-combobox">'+
                    '<select name="baseCurrency" class="currency-convertor-baseCurrency" onChange="ccBaseCurrencyChanged(this)">'+
                        '<option value="CAD">CAD</option>'+
                        '<option value="USD">USD</option>'+
                        '<option value="EUR">EUR</option>'+ 
                    '</select>'+
                '</li>'+
                '<li class="currency-convertor-error-message">Error</li>'+
                '<li class="currency-convertor-full-line">Converted amount:</li>'+
                '<li class="currency-convertor-inputbox"><input class="currency-convertor-input" type="number" name="convertedAmount" placeholder="0.00"  disabled></li>'+
                '<li class="currency-convertor-combobox">'+
                    '<select name="c" class="currency-convertor-convertedCurrency" onChange="ccConvertedCurrencyChanged(this)">'+
                        '<option value="CAD">CAD</option>'+
                        '<option value="USD">USD</option>'+
                        '<option value="EUR">EUR</option>'+ 
                    '</select>'+
                '</li>'+            
                '<li class="currency-convertor-full-line currency-convertor-empty"></li>'+
                '<li class="currency-convertor-disclaimer"><a href="#" onclick="ccShowDisclaimer(this)">Disclaimer</a></li>'+
                '<li class="currency-convertor-full-line currency-convertor-empty"></li>'+
            '</ul>' + 
            '<div class="currency-convertor-disclaimer-message">Rates are updated around 4PM CET every working day. <a href="https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html">Find out more</a></div>';
}

/**
 * 
 * @param {Date} date - date to be formatted
 * @returns {String} - returned date in format of "YYYY-MM-DD"
 */
function ccFormatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

/**
 * Show disclaimer message
 * @param {DOM Object} element - disclaimer link
 */
function ccShowDisclaimer(element) {
    var container = element.parentNode.parentNode.parentNode;
    var message = document.querySelectorAll('#' + container.id + ' .currency-convertor-disclaimer-message')[0];
    console.log(message);
    if (message.style.display == 'none' || message.style.display == "")
        message.style.display = 'block';
    else
        message.style.display = 'none';
} 

/**
 * Show error message
 * @param {String} containerId - current widget container DOM id
 * @param {type} message - message to be displayed
 */
function ccShowErrorMessage (containerId, message) {
    var messageBox = document.querySelectorAll('#' + containerId + ' .currency-convertor-error-message')[0];
    messageBox.style.display = 'block';
    messageBox.innerHTML = message;
}

/**
 * Clear error message
 * @param {String} containerId - current widget container DOM id
 */
function ccClearErrorMessage (containerId) {
    var messageBox = document.querySelectorAll('#' + containerId + ' .currency-convertor-error-message')[0];
    messageBox.style.display = 'none';
    messageBox.innerHTML = '';
}

/**
 * Validate user/remote data, ensure it is number only
 * @param {String} containerId - current widget container DOM id
 * @param {String} value - value to be validated
 * @param {String} message - error message to be shown
 * @returns {Boolean} - return true if value is valid; false otherwise
 */
function ccValidateNumber(containerId, value, message) {
    if (!(/^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/.test(value))) {
        if (value.length > 0)
            ccShowErrorMessage(containerId, message);
        var convertedAmountBox = document.querySelectorAll('#' + containerId + ' .currency-convertor-input')[1];
        convertedAmountBox.value = '';
        return false;
    } else {
        ccClearErrorMessage(containerId);
        return true;
    }        
}
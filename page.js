//define base names and pricing
let base = [
    {
        name: "xs",
        label: "20 users",
        price: 276
    },
    {
        name: "s",
        label: "50 users",
        price: 664
    },
    {
        name: "m",
        label: "100 users",
        price: 1327
    },
    {
        name: "l",
        label: "150 users",
        price: 1937
    },
    {
        name: "xl",
        label: "250 users",
        price: 3211
    },
    {
        name: "xxl",
        label: "500 users",
        price: 6099
    }
];


//define utility features
let utility = {
    pxstore: {
        name: 'PxStore',
        multiplier: 1,
        promoHash: "2b9a5cd2bd0ab0ab466bc6392085df2aa77dac0aad0d4da91d5e77953858091646000d1aac02461971f2815e61c851c5bc7afb74df7c7374782988304777f71e",
        promoDiscount: 20
    },
    pxsign: {
        name: 'PxSign',
        multiplier: 1.2,
        promoHash: "b78d81e171706abb851aaab048bc122c6732a0c08923b19479c229c720ab896a6f06a9b56f7bd512fd2e1c917213fc3c5796ba6ed6781a022f2239401f7afe44",
        promoDiscount: 10
    },
    pxscan: {
        name: 'PxScan',
        multiplier: 1.2,
        promoHash: "fa25ca9dd3d0b88f9fc8a6a5537e25187f3a9554db542d3424c5fb097b50fec101ca369ff6b78ba8012a0041da89f72b44ba2ebdd5b27bbbbbe66b7c4065bb7d",
        promoDiscount: 10
    },
    pxapprove: {
        name: 'PxApprove',
        multiplier: 1.3,
        promoHash: "ed99296162ada56bbe54675cec988b2cb150c702512785d1a9327a9ca2c2b094431e7503e5ecd762e2242e653bd4286d8fc117828ec36ebe4172ccbe40aca3c6",
        promoDiscount: 10
    },
    pxcreate: {
        name: 'PxCreate',
        multiplier: 1.5,
        promoHash: "7732c7e6b3d582ab228bbd585d44022c118da16f002678756f1b7188b60f010d51e21e1f59b915af830bddd233b76b0ec8ed452a1bb6a3c116ee06e8edac9d35",
        promoDiscount: 10
    }
};

let generalPromo = {
    promoHash: "568ade8e727d91ce8431193144bacca52a529dc535fe5b68730758ab7cb50352cdc34e9cf5795b2c5b42416075650f0f1b60290b5b9497bde1eee865c30cd390",
    promoDiscount: 10
};

//define extras
let extras = {
    "corporate-skin": {
        type: "bool",
        price: 100
    },
    "whitelabeling": {
        type: "bool",
        price: 100
    },
    "pxstack-workflows": {
        type: "num",
        price: 100
    },
    "pxstore-extras": {
        type: "num",
        price: 100
    },
    "pxsign-extras": {
        type: "num",
        price: 100
    },
    "pxscan-extras": {
        type: "num",
        price: 100
    },
    "pxapprove-extras": {
        type: "num",
        price: 100
    },
    "pxcreate-extras": {
        type: "num",
        price: 100
    }
};


//initialize checkbox switch for each utility feature
_.each(utility, (value, key) => {
    $("[name='" + key + "']").bootstrapSwitch({
        onSwitchChange: computePrice
    });
});

//initialize checkbox switch for type of payment
$("[name='payment']").change(() => {
    computePrice();
});


//initialize bulk discount
$("[name='bulk']").bootstrapSwitch({
    onSwitchChange: computePrice
});

//initialize corporate skin
$("[name='corporate-skin']").bootstrapSwitch({
    onSwitchChange: computePrice
});

//initialize corporate whitelabeling
$("[name='whitelabeling']").bootstrapSwitch({
    onSwitchChange: computePrice
});

//initialize number extras
_.each(extras, (value, key) => {
    let item = $("[name='" + key + "']");

    if (value.type === "num") {
        item.change(() => {
            computePrice();
        });
    }
});


//initialize promocode
$("[name='promo']").blur(() => {
    computePrice();
});

//initilize slider for sizing
let slider = $("#slider1").slider({
    ticks: [0, 1, 2, 3, 4, 5],
    ticks_labels: _.map(base, (o) => {
        return o.label;
    }),
    ticks_snap_bounds: 30
}).on('change', () => {
    computePrice();
});

//verifies that hash of promocode matches stored hash
function checkHash(text, promoHash) {
    if (text) {
        let shaObj = new jsSHA("SHA-512", "TEXT");
        shaObj.update(text);
        let hash = shaObj.getHash("HEX");

        return hash === promoHash;
    } else return false;
}

//format number into currency format
function formatNum(num) {
    return "$" + num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}


//main computational function
function computePrice() {
    //hide promo row
    $("#promoTextRow").addClass('hidden');

    let useBulkDiscount = false;

    //additional discount for yearly
    if ($("[name='bulk']")[0].checked) {
        useBulkDiscount = true;
    }

    let index = slider.slider('getValue');
    let promoCode = $("#promo").val();

    let basePrice = base[index].price;
    let baseName = base[index].name;
    let nonDiscountedPrice = 0;
    let promoText = "";
    let selectedApps = [];

    let bulkDiscount = -20;
    let pricingDiscount = 0;

    //calculate utility pricing
    _.each(utility, (value, key) => {
        let extras = $("." + key + "-extras");

        extras.addClass('hidden');
        if ($("[name='" + key + "']")[0].checked) {
            extras.removeClass('hidden');

            let pxAppPrice = basePrice * value.multiplier;
            selectedApps.push(value.name);

            if (checkHash(promoCode, value.promoHash)) {
                promoText = "Promocode for " + value.promoDiscount + "% discount on " + value.name;
                pxAppPrice = (pxAppPrice / 100) * (100 - value.promoDiscount);
            }

            nonDiscountedPrice += pxAppPrice;
            bulkDiscount += 10;
        }
    });

    let extrasPricing = 0;

    //calculate extras pricing
    _.each(extras, (value, key) => {
        let item = $("[name='" + key + "']");

        if (value.type === 'bool') {
            if (item[0].checked) {
                $("#" + key + "-price").text(formatNum(value.price));
                extrasPricing += value.price;
            } else {
                $("#" + key + "-price").text(formatNum(0));
            }
        } else {
            $("#" + key + "-price").text(formatNum(value.price * item.val()));
            extrasPricing += value.price * item.val();
        }
    });

    //reset features for each sizing
    _.each(base, (item) => {
        $("." + item.name + "-features").addClass('hidden');
    });
    $("." + baseName + "-features").removeClass('hidden');


    //additional discount for yearly pricing
    if ($("[name='payment']")[1].checked) {
        pricingDiscount += 5;
    }

    //check general promo discount
    let promoDiscount = 0;
    if (checkHash(promoCode, generalPromo.promoHash)) {
        promoText = "Promocode for " + generalPromo.promoDiscount + "% discount";
        promoDiscount = generalPromo.promoDiscount;
    }

    //promocode display
    if (promoText) {
        $("#promoTextRow").removeClass('hidden');
        $("#promoText").text(promoText);
    }

    if (bulkDiscount < 0 || !useBulkDiscount) {
        bulkDiscount = 0;
    }

    let discountedPrice = (nonDiscountedPrice / 100) * (100 - (bulkDiscount + pricingDiscount + promoDiscount));

    let bulkDiscountValue = (nonDiscountedPrice / 100) * bulkDiscount;
    let pricingDiscountValue = (nonDiscountedPrice / 100) * pricingDiscount;

    $(".price-without-discount").text(formatNum(nonDiscountedPrice));
    $(".bulk-discount").text(bulkDiscount + "% (" + formatNum(-bulkDiscountValue) + ")");
    $(".pricing-discount").text(pricingDiscount + "% (" + formatNum(-pricingDiscountValue) + ")");
    $(".price-with-discount").text(formatNum(discountedPrice));

    $(".extras-summary").text(formatNum(extrasPricing));


    if (selectedApps.length > 0) {
        $(".selected-apps").text("(" + selectedApps.join(', ') + ")");
    }

    $(".grand-total").text(formatNum(extrasPricing + discountedPrice));

}


computePrice();
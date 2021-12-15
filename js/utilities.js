(function() {
    
adjustHeight()

function adjustHeight() {
    const elements = ['#nav', '#singleTitle', '#footer']
    let height = 0
    elements.forEach(element => {
        if (document.querySelector(element)) {
            let size = document.querySelector(element)
            height += size.offsetHeight;
        }
    });

    if (document.querySelector("#fullHeight")) {
        let size = window.innerHeight - height
        let mapSize = document.querySelector("#fullHeight")
        mapSize.style.height = `${size}px`
    }

    if (document.querySelector("#two-column")) {
        console.log(window.innerWidth)
        let size = window.innerHeight - height
        let containerSize = document.querySelector("#two-column")
        let mapSize = document.querySelector("#column-map")

        if (window.innerWidth >= 768) {
            containerSize.style.height = `${size}px`
            mapSize.style.height = `${size - 20}px`
        } else {
            containerSize.style.height = `${size/2}px`
            mapSize.style.height = `${size/2 - 20}px`
        }

    }
}

})();

$(document).ready(function(){
    // 안내창 기능
    // 추가기능 : 스크롤바 없애기
    $('html').css('overflow', 'hidden');
    let modalWrap = $('.modal-wrap');
    let modalClose = $('.modal-close');
    modalClose.click(function(){
        modalWrap.stop().fadeOut(100);
        $('html').css('overflow', 'auto')
    });
    let modalMain = $('.modal-main');
    // 내용클릭
    modalMain.click(function(event){
        event.stopPropagation()
    })
    // 배경클릭
    modalWrap.click(function(event){
        $(this).stop().fadeOut(100);
        $('html').css('overflow', 'auto')
    })
});

$(document).ready(function () {
    // .header를 저장한다.
    let header = $('.header');
    let gnb = $('.gnb');
    // 펼칠때 높이
    let gnbMaxHeight = gnb.outerHeight();
    // 닫혀있을 때 높이
    let gnbMinHeight = header.outerHeight();
    // 기본 header에 높이값 적용
    header.css('height',gnbMinHeight)


    gnb.mouseenter(function () {
        header.css('height', gnbMaxHeight);
    });

    gnb.mouseleave(function () {
        header.css('height', gnbMinHeight);
    });

    // 주메뉴 포커스 기능
    let depth_1_Li = $('.depth1 > li');
    $.each(depth_1_Li, function (index) {
        $(this).mouseenter(function () {
            // li 의 > a 를 찾는다.
            $(this).find('>a').addClass('depth1-focus');
        });
        $(this).mouseleave(function () {
            // li 의 > a 를 찾는다.
            $(this).find('>a').removeClass('depth1-focus');
        });
    });

    //컨텐츠 이동버튼
    let visualBt = $('.visual-bt');
    // .part 영역이 html 상단으로부터 어느만큼 떨어져있는가
    let partY = $('.part').offset().top;
    visualBt.click(function(){
        $('html').animate({
            scrollTop: partY
        });
    });

    //part 배경배치
    let partListLi = $('.part-list li');
    let partListW = 1200 / partListLi.length;
    $.each(partListLi, function(index){
        let tgx = partListW * index;
        tgx = -1 * tgx
        $(this).css('background-position-x', tgx);
    });

});

window.onload = function () {}
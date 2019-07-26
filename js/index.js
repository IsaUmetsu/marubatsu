$(function() {
  // 定数定義
  const FIRST = 0
  const LAST  = 1
  const WEAK   = 0
  const NORMAL = 1
  const HARD   = 2
  const TOTAL_CELL   = 9
  const CENTER_CELL  = 4
  const CORNER_CELLS = [0, 2, 6, 8]
  const MARU  = "〇"
  const BATSU = "×"
  const MAX_RATE = 100
  const MIN_RATE = 0
  const RATE_THRESHOLD = 60

  // そろうパターン
  const complete_patterns = [
    [0, 3, 6], // 1列目
    [1, 4, 7], // 2列目
    [2, 5, 8], // 3列目
    [0, 1, 2], // 1行目
    [3, 4, 5], // 2行目
    [6, 7, 8], // 3行目
    [0, 4, 8], // 斜め：左上から右下
    [2, 4, 6]  // 斜め：右上から左下
  ]

  let now_attack = FIRST  // 0: 先攻、1: 後攻

  let got_match = false   // 勝敗がついたか
  let last_cells_count = TOTAL_CELL

  let man_attack = FIRST  // 自分が先攻か後攻か
  let com_skill = WEAK    // 0: 弱い、1: 普通、2: 強い
  let finished_com = true

  $("td").click(function() {
    // 入力済みのセルをタップした場合
    if ($(this).html()) {
      alert("入力できません")
    // 勝敗がついたあとに空のセルをタップした場合
    } else if (got_match) {
      alert("リセットボタンを押してください")
    // COMの入力中にタップした場合
    } else if (! finished_com) {
      alert("COMが入力中です")
    } else {
      // セルに入力する記号
      let result_symbol = now_attack ? BATSU : MARU
      // セルに入力
      $(this).html(result_symbol)
      // 先攻後攻入れ替え
      now_attack = !now_attack

      // 残り入力可能なセル数を計算
      last_cells_count--

      // 勝敗判定
      if (check_complete()) {
        got_match = true
        alert(result_symbol + "の勝ち！")
        return
      // 勝敗つかず、残りセルがなくなった場合、引き分け
      } else if (! last_cells_count) {
        alert("引き分け！")
        return
      }
      // 決着がついていない場合、COMの操作を継続
      if (! got_match) {
        input_by_com()
      }
    }
  })

  /**
   * そろったか判定
   */
  function check_complete() {
    let results = $("td").get()
    let completed = false

    // そろう8パターンがあるかチェック
    for (let cnt = 0; cnt < complete_patterns.length; cnt++) {
      // 1つのパターンを抽出し、そのパターンのセル番号をさらに抽出
      let pattern = complete_patterns[cnt]
      // チェック対象の3つのセルを抽出
      let cell1 = $(results[pattern[0]]).html()
      let cell2 = $(results[pattern[1]]).html()
      let cell3 = $(results[pattern[2]]).html()
      // 3つのセルの内容が等しいか確認（undefined や "" で全て一致することを避けるため、cell1 だけ中身をチェック）
      completed = cell1 && cell1 == cell2 && cell2 == cell3 && cell3 == cell1
      // 1つでもそろった行・列がある場合はチェックを終了
      if (completed) break
    }
    return completed
  }

  /**
   * 「スタート」ボタン押下
   */
  $("#start").click(function() {
    // 攻撃順
    if (! $(".attack.pushed").length) {
      alert("先攻・後攻を選択してください。")
    // 強さ
    } else if (! $(".skill.pushed").length) {
      alert("強さを選択してください。")
    // 両方とも選択している場合
    } else {
      $("#game").css("display", "block")

      if (man_attack == LAST) {
        input_by_com()
      }
    }
  })

  /**
   * リセットボタン押下
   */
  $("#reset").click(function() {
    // ゲーム盤に配置された〇×をすべて削除
    $("td").each(function(idx) { $(this).html("") })
    // ゲーム情報を開始時に戻す
    got_match = false  // 勝敗フラグ
    now_attack = FIRST // 先攻
    last_cells_count = TOTAL_CELL // 残りセル数
    // ゲーム盤を非表示
    $("#game").css("display", "none")
    // 攻撃順・強さの選択状態を解除
    $(".attack, .skill").removeClass("pushed")
  })

  /**
   * 「先攻後攻」ボタン押下
   */
  $(".attack").click(function() {
    let id_name = $(this).attr("id")
    // 「先攻」ボタン押下時
    if (id_name == 'atk_first') { man_attack = FIRST }
    // 後攻ボタン押下時
    else { man_attack = LAST }
    $(".attack").removeClass("pushed")
    $(this).addClass("pushed")
  })

  /**
   * 「弱い」「普通」「強い」ボタン押下
   */
  $(".skill").click(function() {
    let id_name = $(this).attr("id")
    // 押下したボタンに応じた値
    if (id_name == "weak") { com_skill = WEAK }
    else if (id_name == "normal") { com_skill = NORMAL }
    else if (id_name == "hard") { com_skill = HARD }

    $(".skill").removeClass("pushed")
    $(this).addClass("pushed")
  })

  /**
   * COMによる自動入力
   */
  function input_by_com() {
    finished_com = false
    setTimeout(function() {
      let com_result_symbol = do_input_by_com()
      now_attack = !now_attack // 先攻後攻入れ替え
      last_cells_count--

      // 勝敗判定
      if (check_complete()) {
        got_match = !got_match
        alert(com_result_symbol + "の勝ち！")
      }

      // 引き分け判定
      if (! last_cells_count) {
        alert("引き分け！")
        return
      }
      finished_com = true
    }, 500)
  }

  /**
   * COMによる自動入力実行
   */
  function do_input_by_com() {
    // 現在の入力情報を取得
    let results = $("td").get()
    // COMのマーク
    let com_result_symbol = now_attack ? BATSU : MARU
    
    let empty_cell_ids = [] // 未入力セル情報
    let own_cell_ids = []   // COM入力セル情報
    let man_cell_ids = []   // プレイヤー入力セル情報
    // ゲーム盤情報確認（該当するものについて、idを数値型に変換して格納）
    for (let cnt = 0; cnt < results.length; cnt++) {
      // 未入力の場合
      if (! $(results[cnt]).html()) {
        empty_cell_ids.push(Number($(results[cnt]).attr("id")))
      // COMが取ったセルの場合
      } else if ($(results[cnt]).html() == com_result_symbol) {
        own_cell_ids.push(Number($(results[cnt]).attr("id")))
      // プレイヤーが取ったセルの場合
      } else {
        man_cell_ids.push(Number($(results[cnt]).attr("id")))
      }
    }

    // 未入力セルがある場合
    if (empty_cell_ids.length) {
      logic(empty_cell_ids, own_cell_ids, man_cell_ids, com_result_symbol)
    }

    return com_result_symbol
  }

  /**
   * ロジック
   */
  function logic(empty_cell_ids, own_cell_ids, man_cell_ids, com_result_symbol) {
    let target_cell_id
    
    // 弱い場合、ランダムに1つ選択
    if (com_skill == WEAK) { target_cell_id = get_id_by_random(empty_cell_ids) }
    // 普通 or 強い
    else {
      let rate;

      // 強い場合は常に正攻法ロジック
      if (com_skill == HARD) { rate = MIN_RATE }
      // 普通の場合は、一定の確率で正攻法ロジックを選択させる
      else if (com_skill == NORMAL) { rate = Math.floor(Math.random() * MAX_RATE) }

      // 確率を超えている場合、正攻法ロジック
      if (rate < RATE_THRESHOLD) {        
        // 中央が空いている場合、真っ先に取得
        if (empty_cell_ids.indexOf(CENTER_CELL) > -1) { target_cell_id = CENTER_CELL }
        // 真ん中が埋まっている場合、それ以外の場所を取る
        else {
          // COM、プレイヤーのリーチの有無を確認
          let { complete_cells: com_complete_cells, is_center: com_is_center } = check_reach(own_cell_ids)
          let { complete_cells: man_complete_cells } = check_reach(man_cell_ids)

          // 空いている角のセル番号を取得
          let empty_corner = empty_cell_ids.filter(function(empty_cell_id) { return CORNER_CELLS.indexOf(empty_cell_id) > -1 })

          let com_has_reach = com_complete_cells.length // COMにリーチがあるか
          let man_has_reach = man_complete_cells.length // プレイヤーにリーチがあるか
          let is_empty_corner = empty_corner.length     // 角に空きがあるか
  
          // 1. COMにリーチがある場合
          //     COMのリーチをそろえるように選択
          if (com_has_reach) { target_cell_id = com_complete_cells[0] }
          // 2. COMにリーチがなく、プレイヤーにリーチがある場合
          //     プレイヤーのリーチを阻止するよう選択
          else if (! com_has_reach && man_has_reach) { target_cell_id = man_complete_cells[0] }
          // 3. COM・プレイヤーともにリーチがなく、中央をCOMが取得している場合
          //     空いているセルからランダムに選択
          else if (! (com_has_reach || man_has_reach) && com_is_center) { target_cell_id = get_id_by_random(empty_cell_ids) }
          // 4. COM・プレイヤーともにリーチがなく、中央をプレイヤーが取得している中で、角が空いている場合
          //     空いている角からランダムに選択
          else if (! (com_has_reach || man_has_reach || com_is_center) && is_empty_corner) { target_cell_id = get_id_by_random(empty_corner) }
          // 5. COM・プレイヤーともにリーチがなく、中央をプレイヤーが取得している中で、角が空いていない場合
          //     残りからランダムに選択
          else if (! (com_has_reach || man_has_reach || com_is_center || is_empty_corner)) { target_cell_id = get_id_by_random(empty_cell_ids) }
          // 6. その他の場合
          //     残りからランダムに選択
          else { target_cell_id = get_id_by_random(empty_cell_ids) }
        }
      // ランダムに1つ取得
      } else { target_cell_id = get_id_by_random(empty_cell_ids) }
    }
    // 結果を入れる
    $("#" + target_cell_id).html(com_result_symbol)
  }

  function get_id_by_random(cell_ids) { return cell_ids[Math.floor(Math.random() * cell_ids.length)] }

  function check_reach(cell_ids) {

    // リーチパターン1: 真ん中を含む
    // 真ん中のセルが自分のものであるか
    let is_center = cell_ids.indexOf(CENTER_CELL) > -1
    let reach_lines = []

    // 真ん中が自分のセルの場合、真ん中とその他で2連続があるか確認
    if (is_center) {
      // 真ん中以外に自分のセルがあるか
      let exclude_center_cell_ids = cell_ids.filter(function(x) { return x != CENTER_CELL })
      // ある場合
      if (exclude_center_cell_ids.length) {
        reach_lines = exclude_center_cell_ids.map(function(x) { return [x, CENTER_CELL] })
      }
    }
    // リーチパターン2: 外周の4ラインだけでリーチとなる(真ん中を含まない)
    let target_pattern = [
      // 外周4ラインで2連続
      [0, 1], [1, 2], [0, 3], [3, 6],
      [2, 5], [5, 8], [6, 7], [7, 8],
      // 外周4ラインの角同士
      [0, 2], [0, 6], [0, 8],
      [2, 6], [2, 8], [6, 8]
    ]
    // 真ん中以外のセルで2つ連続したセルがあるか
    let exist_pattern = target_pattern.filter(function(pattern) {
      // COMが取得したセル同士であるか          
      return cell_ids.indexOf(pattern[0]) > -1 && cell_ids.indexOf(pattern[1]) > -1
    })
    // 2連続のラインがある場合
    if (exist_pattern.length) {
      // 真ん中を含む結果とマージ
      reach_lines = reach_lines.concat(exist_pattern)
    }

    // プレイヤーがリーチで、もう1つのセルに自分のセルがない列を取得
    let complete_cells = reach_lines.reduce(function(accumelator, reach_line) {
      // リーチがかかっている列の、そろったパターンを抽出
      let target_pattern = complete_patterns.filter(function(complete_pattern) {
        return complete_pattern.indexOf(reach_line[0]) > -1 && complete_pattern.indexOf(reach_line[1]) > -1
      })[0]
      // リーチがかかっている、残りの1セルの番号を取得
      let remaining_cell_id = target_pattern.filter(function(x) { return reach_line.indexOf(x) == -1 })[0]
      // 既に阻止しているか確認
      if (! $("#" + remaining_cell_id).html()) { accumelator.push(remaining_cell_id) }
      return accumelator
    }, [])
    
    return { complete_cells, is_center }
  }
})
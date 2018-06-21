<template lang="pug">
.langWrapper
  .b-table
      .b-table__head.b-table__display
          .b-table__col(v-for='(head, index) in table.head' :class='"b-table__col-" + (index + 1)') {{head.title}}
            ISO(v-if="index == 3" :titlesp1="titlesp1Value" titlesp2="(two letters)")
            ISO1(v-if="index == 4" :titlesp3="titlesp2Value" titlesp4="(three letters)")
      .b-table__body.b-table__display
        .b-table__row(v-for='(fullRowInfo, rowIndex) in table.body')
            .b-table__col.higher(v-for='(row, index) in fullRowInfo.rowInfo' :class='["b-table__col-" + (index + 1), {set_bottom_border: index == 0 || index == 1 || index == 2 || index == 3 || index == 4 || index == 5 || index == 6}]') {{row.title}} 
              TableImage(v-if='index === 0' :body='row' :isActiveUpload='fullRowInfo.isActiveUpload')
              input.clazz1(v-if="index == 1" type="text" v-model="row.title" :readonly="!fullRowInfo.isActiveUpload")
              input.clazz2(v-if="index == 2" type="text" v-model="row.title" :readonly="!fullRowInfo.isActiveUpload")
              input.clazz3(v-if="index == 3" type="text" v-model="row.title" :readonly="!fullRowInfo.isActiveUpload")
              input.clazz4(v-if="index == 4" type="text" v-model="row.title" :readonly="!fullRowInfo.isActiveUpload")
              Select(v-if='index === 5' :isActiveUpload='fullRowInfo.isActiveUpload')
              RowEdit(v-if='index === 6' @onEdit='editRow(rowIndex)' :status='fullRowInfo.activeTools' @onRemove='removeRow(rowIndex)' @onSave="saveRow(indexRow)")
  img.addLang(src="../../assets/images/Other/add-icon.png" @click="addLang")
  .addLangBlocker(v-if="disableAddLang")
</template>

<script>
import Select from "./rows/TableSelect";
import TableImage from "./rows/TableImage";
import RowEdit from "./rows/RowEdit";
import ISO from "./rows/ISO";
import ISO1 from "./rows/ISO1";

const row = {
  activeTools: [true, false, true],
  isActiveUpload: true,
  rowInfo: [
    {
      image1: "",
      image2: require("../../assets/images/Other/upload-icon.png")
    },
    { title: "" },
    { title: "" },
    { title: "" },
    { title: "" },
    { title: "" },
    {
      title: ""
    }
  ]
};

export default {
  props: {},
  data() {
    return {
      table: {
        head: [
          { title: "Icon" },
          { title: "Name" },
          { title: "Symbol" },
          { title: "" },
          { title: "" },
          { title: "Active" },
          { title: "" }
        ],
        body: [
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Afrikaans [AF].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Africaans" },
              { title: "AF" },
              { title: "af" },
              { title: "afr" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Arabic (Egypt) [AR-EG].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Arabic (Egypt)" },
              { title: "AR-EG" },
              { title: "ar-EG" },
              { title: "ara-EG" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Arabic (Morocco) [AR-MA].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Arabic (Morocco)" },
              { title: "AR-MA" },
              { title: "ar-MA" },
              { title: "ara-MA" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Arabic (Saudi Arabia) [AR-SA].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Arabic (Saudi Arabia)" },
              { title: "AR-SA" },
              { title: "ar-SA" },
              { title: "ara-SA" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Armenian [HY].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Armenian" },
              { title: "HY" },
              { title: "hy-AM" },
              { title: "hye" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Azerbaijani (Latin) [AZ-LN].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Azerbaijani (Latin)" },
              { title: "AZ-LN" },
              { title: "az-AZ-Latn" },
              { title: "aze" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Bengali (India) [BN-IN].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Bengali (India)" },
              { title: "BN-IN" },
              { title: "bn_IN" },
              { title: "ben_IN" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Bosnian [BS].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Bosnian" },
              { title: "BS" },
              { title: "bs" },
              { title: "bos" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Bulgarian [BG].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Bulgarian" },
              { title: "BG" },
              { title: "bg-BG" },
              { title: "bul" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Chinese (Hong Kong) [ZH-HK].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Chinese (Hong Kong)" },
              { title: "ZH-HK" },
              { title: "zh-HK" },
              { title: "zho-HK" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Chinese (Macao) [ZH-MO].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Chinese (Macao)" },
              { title: "ZH-MO" },
              { title: "zh-MO" },
              { title: "zho-MO" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Chinese (Singapore) [ZH-SG].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Chinese (Singapore)" },
              { title: "ZH-SG" },
              { title: "zh-SG" },
              { title: "zho-SG" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Chinese (Taiwan) [ZH-TW].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Chinese (Taiwan)" },
              { title: "ZH-TW" },
              { title: "zh-TW" },
              { title: "zho-TW" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Croatian [HR].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Croatian" },
              { title: "HR" },
              { title: "hr-HR" },
              { title: "hrv" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Czech [CS].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Czech" },
              { title: "CS" },
              { title: "cs-CZ" },
              { title: "cze" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Danish [DA].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Danish" },
              { title: "DA" },
              { title: "da-DK" },
              { title: "dan" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Dutch [NL].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Dutch" },
              { title: "NL" },
              { title: "nl" },
              { title: "dut" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Dutch (Netherlands) [NL-NL].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Dutch (Netherlands)" },
              { title: "NL-NL" },
              { title: "nl-NL" },
              { title: "dut-NL" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/English_English (United Kingdom) [EN-GB].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "English_English (United Kingdom)" },
              { title: "EN-GB" },
              { title: "en-GB" },
              { title: "eng-GB" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/English (United States) [EN-US].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "English (United States)" },
              { title: "EN-US" },
              { title: "en-US" },
              { title: "eng-US" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Estonian [ET].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Estonian" },
              { title: "ET" },
              { title: "et-EE" },
              { title: "est" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Farsi (Persian) [FA].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Farsi (Persian)" },
              { title: "FA" },
              { title: "fa-IR" },
              { title: "fas" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Finnish [FI].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Finnish" },
              { title: "FI" },
              { title: "fi-FI" },
              { title: "fin" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Flemish [NL-BE].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Flemish" },
              { title: "NL-BE" },
              { title: "nl-BE" },
              { title: "dut-BE" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/French (Belgium) [FR-BE].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "French (Belgium)" },
              { title: "FR-BE" },
              { title: "fr-BE" },
              { title: "fre-BE" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/French (Canada) [FR-CA].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "French (Canada)" },
              { title: "FR-CA" },
              { title: "fr-CA" },
              { title: "fre-CA" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/French (France) [FR-FR].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "French (France)" },
              { title: "FR-FR" },
              { title: "fr-FR" },
              { title: "fre-FR" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/French (Switzerland) [FR-CH].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "French (Switzerland)" },
              { title: "FR-CH" },
              { title: "fr-CH" },
              { title: "fre-CH" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Georgian [KA].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Georgian" },
              { title: "KA" },
              { title: "ka-GE" },
              { title: "kat" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/German (Austria) [DE-AT].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "German (Austria)" },
              { title: "DE-AT" },
              { title: "de-AT" },
              { title: "ger-AT" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/German [DE].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "German" },
              { title: "DE" },
              { title: "de" },
              { title: "ger" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/German (Germany) [DE-DE].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "German" },
              { title: "DE-DE" },
              { title: "de-DE" },
              { title: "ger-DE" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/German (Switzerland) [DE-CH].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "German (Switzerland)" },
              { title: "DE-CH" },
              { title: "de-CH" },
              { title: "ger-CH" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Greek [EL].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Greek" },
              { title: "EL" },
              { title: "el-GR" },
              { title: "gre" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Hebrew [HE].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Hebrew" },
              { title: "HE" },
              { title: "he-IL" },
              { title: "heb" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Hindi [HI].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Hindi" },
              { title: "HI" },
              { title: "hi-IN" },
              { title: "hin" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Hungarian [HU].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Hungarian" },
              { title: "HU" },
              { title: "hu-HU" },
              { title: "hun" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Icelandic [IS].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Icelandic" },
              { title: "IS" },
              { title: "is-IS" },
              { title: "ice" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Indonesian [ID].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Indonesian" },
              { title: "ID" },
              { title: "id-ID" },
              { title: "ind" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Italian [IT].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Italian" },
              { title: "IT" },
              { title: "it" },
              { title: "ita" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Italian (Italy) [IT-IT].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Italian (Italy)" },
              { title: "IT-IT" },
              { title: "it-IT" },
              { title: "ita-IT" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Italian (Switzerland) [IT-CH].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Italian (Switzerland)" },
              { title: "IT-CH" },
              { title: "it-CH" },
              { title: "ita-CH" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Japanese [JA].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Japanese" },
              { title: "JA" },
              { title: "ja-JP" },
              { title: "jpn" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Kazakh [KK].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Kazakh" },
              { title: "KK" },
              { title: "kk-KZ" },
              { title: "kaz" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Korean [KO].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Korean" },
              { title: "KO" },
              { title: "ko-KR" },
              { title: "kor" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Latvian [LV].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Latvian" },
              { title: "LV" },
              { title: "lv-LV" },
              { title: "lav" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Lithuanian [LT].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Lithuanian" },
              { title: "LT" },
              { title: "lt-LT" },
              { title: "lit" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Malay [MS].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Malay" },
              { title: "MS" },
              { title: "ms-MY" },
              { title: "msa" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Marathi [MR].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Marathi" },
              { title: "MR" },
              { title: "mr-IN" },
              { title: "mar" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Moldavian [MO].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Moldavian" },
              { title: "MO" },
              { title: "mo-MD" },
              { title: "mol" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Norwegian (Bokmaal) [NB].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Norwegian (Bokmaal)" },
              { title: "NB" },
              { title: "nb-NO" },
              { title: "nnb" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Polish [PL].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Polish" },
              { title: "PL" },
              { title: "pl-PL" },
              { title: "pol" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Portuguese (Portugal) [PT-PT].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Portuguese (Brazil)" },
              { title: "PT-BR" },
              { title: "pt-BR" },
              { title: "por-BR" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Portuguese (Brazil) [PT-BR].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Portuguese (Brazil)" },
              { title: "PT-BR" },
              { title: "pt-BR" },
              { title: "por-BR" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Punjabi [PA].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Punjabi" },
              { title: "PA" },
              { title: "pa-PA" },
              { title: "pan" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Punjabi [PA].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Punjabi" },
              { title: "PA" },
              { title: "pa-PA" },
              { title: "pan" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Romanian [RO].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Romanian" },
              { title: "RO" },
              { title: "ro-RO" },
              { title: "rum" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Romanian [RO].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Romanian" },
              { title: "RO" },
              { title: "ro-RO" },
              { title: "rum" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Russian [RU].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Russian" },
              { title: "RU" },
              { title: "ru-RU" },
              { title: "rus" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Serbian (Latin) [SR-LA].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Serbian (Latin)" },
              { title: "SR-LA" },
              { title: "sr-LA" },
              { title: "scr" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Simplified Chinese_Chinese (China) [ZH-CN]_Traditional Chinese - Copy.png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Simplified Chinese_Chinese (China)" },
              { title: "ZH-CN" },
              { title: "zh-CN" },
              { title: "zho-CN" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Slovak [SK].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Slovak" },
              { title: "SK" },
              { title: "sk-SK" },
              { title: "slo" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Slovenian [SL].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Slovenian" },
              { title: "SL" },
              { title: "sl-SL" },
              { title: "slv" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Spanish (Argentina) [ES-AR].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Spanish (Argentina)" },
              { title: "ES-AR" },
              { title: "es-AR" },
              { title: "spa-AR" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Spanish (Latin America) [ES-419].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Spanish (Latin America)" },
              { title: "ES-419" },
              { title: "es-AR" },
              { title: "spa-419" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Spanish (Mexico) [ES-MX].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Spanish (Mexico)" },
              { title: "ES-MX" },
              { title: "es-MX" },
              { title: "spa-MX" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Spanish (Mexico) [ES-MX].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Spanish (Mexico)" },
              { title: "ES-MX" },
              { title: "es-MX" },
              { title: "spa-MX" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Spanish (Spain) [ES-ES].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Spanish (Spain)" },
              { title: "ES-ES" },
              { title: "es-ES" },
              { title: "spa-ES" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Swedish (Sweden) [SV-SE].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Swedish (Sweden)" },
              { title: "SV-SE" },
              { title: "sv-SE" },
              { title: "swe-SE" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Swedish (Sweden) [SV-SE].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Swedish (Sweden)" },
              { title: "SV-SE" },
              { title: "sv-SE" },
              { title: "swe-SE" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Tagalog [TL].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Tagalog" },
              { title: "TL" },
              { title: "tl-PH" },
              { title: "tgl" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Tagalog [TL].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Tagalog" },
              { title: "TL" },
              { title: "tl-PH" },
              { title: "tgl" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Thai [TH].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Thai" },
              { title: "TH" },
              { title: "th-TH" },
              { title: "tai" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Turkish [TR].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Turkish" },
              { title: "TR" },
              { title: "tr-TR" },
              { title: "tur" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Turkmen [TK].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Turkmen" },
              { title: "TK" },
              { title: "tk-TM" },
              { title: "tuk" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Ukrainian [UK].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Ukrainian" },
              { title: "UK" },
              { title: "uk-UA" },
              { title: "ukr" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Urdu [UR].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Urdu" },
              { title: "UR" },
              { title: "ur-IN" },
              { title: "urd" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Uzbek [UZ].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Uzbek" },
              { title: "UZ" },
              { title: "uz-UZ-Latn" },
              { title: "uzb" },
              { title: "" },
              { title: "" }
            ]
          },
          {
            activeTools: [false, true, true],
            isActiveUpload: false,
            rowInfo: [
              {
                image1: require("../../assets/images/flags 31x21pix/Vietnamese [VI].png"),
                image2: require("../../assets/images/Other/upload-icon.png")
              },
              { title: "Vietnamese" },
              { title: "VI" },
              { title: "vi-VN" },
              { title: "vie" },
              { title: "" },
              { title: "" }
            ]
          },
        ]
      },
      titlesp1Value: "ISO 639-1",
      titlesp2Value: "ISO 639-2",
      disableAddLang: false,
      languages: [],
      selectLang: []
    };
  },
  methods: {
    addLang() {
      this.table.body.push(row);
      this.disableAddLang = true;
    },
    editRow(index) {
      console.log('index from RowEdit' + index);
      this.table.body[index].isActiveUpload = true;

      this.table.body[index].activeTools.splice(0, 1, true);
      this.table.body[index].activeTools.splice(1, 1, false);
      this.table.body[index].activeTools.splice(2, 1, true);
    },
    removeRow(ind) {
      console.log(ind);
      this.table.body.splice(ind, 1);
    },
    async getLanguages() {
      await this.$http
        .get("api/languages")
        .then(response => {
          this.languages = response;
        })
        .catch(e => {
          this.errors.push(e);
        });
    },
  },

  computed: {},
  components: {
    TableImage,
    Select,
    RowEdit,
    ISO,
    ISO1
  },
  mounted() {
    this.getLanguages();
  }
};
</script>

<style lang="scss" scoped>
.langWrapper {
  .b-table {
    &__row {
      width: 103%;
      display: flex;
      padding: 0px 0 44px 0;
    }
    &__head {
      background-color: #68573e;
      opacity: 0.67;
      display: flex;
      color: white;
      .b-table__col {
        border-right: 1px solid white;
        &:last-child {
          border: none;
        }
      }
    }
    &__body {
      display: flex;
      flex-direction: column;
      max-height: 137px;
      overflow-y: scroll;
      overflow-x: hidden;
      .b-table__col {
        border: 1px solid #675842;
        border-right: 0.5px;
        border-top: 0;
        // &:last-child {
        //   border-right: 1px;
        //   border: 1px solid #675842;
        // }
      }
    }
    &__col {
      padding-left: 10px;
      padding-top: 5px;
      padding-bottom: 5px;
      padding-right: 10px;
      display: flex;
      align-items: center;
      &-1 {
        flex-basis: 15%;
      }
      &-2 {
        flex-basis: 21%;
        border-bottom: 0;
        position: relative;
        .clazz1 {
          position: absolute;
          top: 3px;
          left: 10px;
          background-color: #fff;
          font-size: 14px;
          border: none;
          outline: none;
          padding: 10px 27px 10px 0;
          color: #675842;
        }
      }
      &-3 {
        flex-basis: 10%;
        position: relative;
        .clazz2 {
          position: absolute;
          top: 10px;
          left: 10px;
          background-color: #fff;
          font-size: 14px;
          border: none;
          outline: none;
          padding: 5px 0;
          color: #675842;
        }
      }
      &-4 {
        flex-basis: 12%;
        position: relative;
        .clazz3 {
          position: absolute;
          top: 10px;
          left: 10px;
          background-color: #fff;
          font-size: 14px;
          border: none;
          outline: none;
          padding: 5px 0;
          color: #675842;
          width: 80px;
        }
      }
      &-5 {
        flex-basis: 12%;
        position: relative;
        .clazz4 {
          position: absolute;
          top: 10px;
          left: 10px;
          background-color: #fff;
          font-size: 14px;
          border: none;
          outline: none;
          padding: 5px 0;
          color: #675842;
          width: 50px;
        }
      }
      &-6 {
        flex-basis: 11%;
        padding-right: 0;
      }
      &-7 {
        flex-basis: 16%;
        border-bottom: 0;
        border-top: 0;
      }
    }
    .set_bottom_border {
      border-bottom-width: 1px;
      border-bottom-style: solid;
      border-bottom-color: #675842;
    }
    .higher {
      height: 46px;
      font-size: 14px;
    }
  }
  .addLang {
    cursor: pointer;
  }
  .addLangBlocker {
    height: 29px;
    width: 32px;
    position: absolute;
    top: 259px;
  }
}

::-webkit-scrollbar {
  width: 27px;
  background-color: #e7e0e0;
}
::-webkit-scrollbar-thumb {
  border-color: #675842;
  background-color: #675842;
  border-right: solid 9px #e7e0e0;
  border-left: solid 9px #e7e0e0;
}
::-webkit-scrollbar-thumb:vertical {
  height: 12px;
}
</style>
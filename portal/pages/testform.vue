<template>
    <form action="https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8" method="POST">

        <input type=hidden name="oid" value="00D1r000001nlsn">
        <input type=hidden name="retURL" value="http://www.pangea.global/thank-you">

        <!--  ----------------------------------------------------------------------  -->
        <!--  NOTE: These fields are optional debugging elements. Please uncomment    -->
        <!--  these lines if you wish to test in debug mode.                          -->
        <!--  <input type="hidden" name="debug" value=1>                              -->
        <!--  <input type="hidden" name="debugEmail" value="michal@pangea.global">    -->
        <!--  ----------------------------------------------------------------------  -->

        Service Type:<input  id="00N1r00000HRi9E" maxlength="255" name="00N1r00000HRi9E" size="20" type="hidden" /><br>

        Source Language:<input  id="00N1r00000HRi9J" maxlength="255" name="00N1r00000HRi9J" size="20" type="hidden" /><br>

        Target Language:<textarea  id="00N1r00000HRiDb" name="00N1r00000HRiDb" rows="3" type="hidden" wrap="soft"></textarea><br>

        Industry:<input  id="00N1r00000HRiDg" maxlength="255" name="00N1r00000HRiDg" size="20" type="hidden" /><br>

        Project Files:<input  id="00N1r00000HRiDl" maxlength="255" name="00N1r00000HRiDl" size="20" type="hidden" /><br>

        Reference FIles:<input  id="00N1r00000HRiDq" maxlength="255" name="00N1r00000HRiDq" size="20" type="hidden" /><br>

        Suggested Deadline:<span class="dateInput dateOnlyInput"><input  id="00N1r00000HRiDv" name="00N1r00000HRiDv" size="12" type="hidden" /></span><br>

        Brief:<textarea  id="00N1r00000HRiE0" name="00N1r00000HRiE0" type="hidden" wrap="soft"></textarea><br>

        Full Name:<input  id="00N1r00000HRiE5" maxlength="255" name="00N1r00000HRiE5" size="20" type="hidden" /><br>

        <label for="email">Email</label><input  id="email" maxlength="80" name="email" size="20" type="hidden" /><br>

        <label for="phone">Phone</label><input  id="phone" maxlength="40" name="phone" size="20" type="hidden" /><br>

        <label for="company">Company</label><input  id="company" maxlength="40" name="company" size="20" type="hidden" /><br>

        <label for="URL">Website</label><input  id="URL" maxlength="80" name="URL" size="20" type="hidden" /><br>

        Skype Name:<input  id="00N1r00000HRiEF" maxlength="255" name="00N1r00000HRiEF" size="20" type="hidden" /><br>

        GCLID:<input  id="00N1r00000Fie4G" maxlength="255" name="00N1r00000Fie4G" size="20" type="hidden" /><br>

        <input type="submit" name="submit">

    </form>
</template>

<script>
export default {};
</script>

<style lang="scss">

</style>


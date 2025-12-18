package com.talent_tandem.model;
import com.talent_tandem.enums.Day;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Availability {

      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      private Long id;

      @Enumerated(EnumType.STRING)
      private Day dayOfWeek;
      private String startTime;
      private String endTime;

      @OneToOne
      @JoinColumn(name = "user_id")
      private User user;

}
